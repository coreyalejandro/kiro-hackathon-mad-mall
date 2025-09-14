/**
 * SQLite Data Source Implementation
 * Data source for migrating from SQLite databases
 */
import { DataSource } from './migration-service';
export declare class SQLiteDataSource implements DataSource {
    private db?;
    private filePath;
    constructor(filePath: string);
    /**
     * Connect to SQLite database
     */
    connect(): Promise<void>;
    /**
     * Disconnect from SQLite database
     */
    disconnect(): Promise<void>;
    /**
     * Execute query and return results
     */
    query(sql: string, params?: any[]): Promise<any[]>;
    /**
     * Get all table names in the database
     */
    getTableNames(): Promise<string[]>;
    /**
     * Get row count for a table
     */
    getRowCount(tableName: string): Promise<number>;
    /**
     * Get table schema information
     */
    getTableSchema(tableName: string): Promise<Array<{
        name: string;
        type: string;
        notnull: boolean;
        pk: boolean;
    }>>;
    /**
     * Check if table exists
     */
    tableExists(tableName: string): Promise<boolean>;
    /**
     * Get sample data from table for analysis
     */
    getSampleData(tableName: string, limit?: number): Promise<any[]>;
    /**
     * Execute multiple queries in a transaction
     */
    executeTransaction(queries: Array<{
        sql: string;
        params?: any[];
    }>): Promise<void>;
    /**
     * Analyze database structure and suggest migration mappings
     */
    analyzeDatabaseStructure(): Promise<{
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
    }>;
    /**
     * Generate suggested migration mapping for a table
     */
    private generateSuggestedMapping;
    /**
     * Export table data to JSON for backup
     */
    exportTableToJSON(tableName: string): Promise<any[]>;
    /**
     * Get database file size
     */
    getDatabaseSize(): Promise<number>;
    /**
     * Vacuum database to optimize size
     */
    vacuum(): Promise<void>;
}
