/**
 * SQLite Data Source Implementation
 * Data source for migrating from SQLite databases
 */

import { DataSource } from './migration-service';
import * as sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export class SQLiteDataSource implements DataSource {
  private db?: Database<sqlite3.Database, sqlite3.Statement>;
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /**
   * Connect to SQLite database
   */
  async connect(): Promise<void> {
    this.db = await open({
      filename: this.filePath,
      driver: sqlite3.Database,
    });
  }

  /**
   * Disconnect from SQLite database
   */
  async disconnect(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = undefined;
    }
  }

  /**
   * Execute query and return results
   */
  async query(sql: string, params?: any[]): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      const result = await this.db.all(sql, params);
      return result;
    } catch (error) {
      console.error('SQLite query error:', error);
      throw error;
    }
  }

  /**
   * Get all table names in the database
   */
  async getTableNames(): Promise<string[]> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const result = await this.db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);

    return result.map(row => row.name);
  }

  /**
   * Get row count for a table
   */
  async getRowCount(tableName: string): Promise<number> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const result = await this.db.get(`SELECT COUNT(*) as count FROM ${tableName}`);
    return result?.count || 0;
  }

  /**
   * Get table schema information
   */
  async getTableSchema(tableName: string): Promise<Array<{
    name: string;
    type: string;
    notnull: boolean;
    pk: boolean;
  }>> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const result = await this.db.all(`PRAGMA table_info(${tableName})`);
    return result.map(row => ({
      name: row.name,
      type: row.type,
      notnull: row.notnull === 1,
      pk: row.pk === 1,
    }));
  }

  /**
   * Check if table exists
   */
  async tableExists(tableName: string): Promise<boolean> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const result = await this.db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name=?
    `, [tableName]);

    return result !== undefined;
  }

  /**
   * Get sample data from table for analysis
   */
  async getSampleData(tableName: string, limit: number = 10): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    return await this.db.all(`SELECT * FROM ${tableName} LIMIT ?`, [limit]);
  }

  /**
   * Execute multiple queries in a transaction
   */
  async executeTransaction(queries: Array<{ sql: string; params?: any[] }>): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    await this.db.exec('BEGIN TRANSACTION');

    try {
      for (const query of queries) {
        await this.db.run(query.sql, query.params);
      }
      await this.db.exec('COMMIT');
    } catch (error) {
      await this.db.exec('ROLLBACK');
      throw error;
    }
  }

  /**
   * Analyze database structure and suggest migration mappings
   */
  async analyzeDatabaseStructure(): Promise<{
    tables: Array<{
      name: string;
      rowCount: number;
      columns: Array<{
        name: string;
        type: string;
        notnull: boolean;
        pk: boolean;
      }>;
      sampleData: any[];
    }>;
    suggestedMappings: Record<string, any>;
  }> {
    const tables = await this.getTableNames();
    const analysis: any = {
      tables: [],
      suggestedMappings: {},
    };

    for (const tableName of tables) {
      const rowCount = await this.getRowCount(tableName);
      const columns = await this.getTableSchema(tableName);
      const sampleData = await this.getSampleData(tableName, 5);

      analysis.tables.push({
        name: tableName,
        rowCount,
        columns,
        sampleData,
      });

      // Generate suggested mapping based on table structure
      analysis.suggestedMappings[tableName] = this.generateSuggestedMapping(tableName, columns, sampleData);
    }

    return analysis;
  }

  /**
   * Generate suggested migration mapping for a table
   */
  private generateSuggestedMapping(tableName: string, columns: any[], sampleData: any[]): any {
    const mapping: any = {
      entityType: tableName.toUpperCase(),
      sourceTable: tableName,
      keyMapping: {},
      fieldMapping: {},
    };

    // Find primary key column
    const pkColumn = columns.find(col => col.pk);
    if (pkColumn) {
      mapping.keyMapping.pk = (item: any) => `${tableName.toUpperCase()}#${item[pkColumn.name]}`;
      mapping.keyMapping.sk = () => 'METADATA';
    }

    // Map all columns to fields
    columns.forEach(column => {
      if (column.name !== 'id') {
        mapping.fieldMapping[column.name] = column.name;
      } else {
        mapping.fieldMapping[`${tableName}Id`] = 'id';
      }
    });

    // Add common transformations
    mapping.transformations = [
      {
        field: 'createdAt',
        transform: (value: any) => value ? new Date(value).toISOString() : new Date().toISOString(),
      },
      {
        field: 'updatedAt',
        transform: (value: any) => value ? new Date(value).toISOString() : new Date().toISOString(),
      },
    ];

    return mapping;
  }

  /**
   * Export table data to JSON for backup
   */
  async exportTableToJSON(tableName: string): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    return await this.db.all(`SELECT * FROM ${tableName}`);
  }

  /**
   * Get database file size
   */
  async getDatabaseSize(): Promise<number> {
    const fs = await import('fs/promises');
    try {
      const stats = await fs.stat(this.filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Vacuum database to optimize size
   */
  async vacuum(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    await this.db.exec('VACUUM');
  }
}