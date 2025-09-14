"use strict";
/**
 * SQLite Data Source Implementation
 * Data source for migrating from SQLite databases
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteDataSource = void 0;
const sqlite3 = __importStar(require("sqlite3"));
const sqlite_1 = require("sqlite");
class SQLiteDataSource {
    constructor(filePath) {
        this.filePath = filePath;
    }
    /**
     * Connect to SQLite database
     */
    async connect() {
        this.db = await (0, sqlite_1.open)({
            filename: this.filePath,
            driver: sqlite3.Database,
        });
    }
    /**
     * Disconnect from SQLite database
     */
    async disconnect() {
        if (this.db) {
            await this.db.close();
            this.db = undefined;
        }
    }
    /**
     * Execute query and return results
     */
    async query(sql, params) {
        if (!this.db) {
            throw new Error('Database not connected');
        }
        try {
            const result = await this.db.all(sql, params);
            return result;
        }
        catch (error) {
            console.error('SQLite query error:', error);
            throw error;
        }
    }
    /**
     * Get all table names in the database
     */
    async getTableNames() {
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
    async getRowCount(tableName) {
        if (!this.db) {
            throw new Error('Database not connected');
        }
        const result = await this.db.get(`SELECT COUNT(*) as count FROM ${tableName}`);
        return result?.count || 0;
    }
    /**
     * Get table schema information
     */
    async getTableSchema(tableName) {
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
    async tableExists(tableName) {
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
    async getSampleData(tableName, limit = 10) {
        if (!this.db) {
            throw new Error('Database not connected');
        }
        return await this.db.all(`SELECT * FROM ${tableName} LIMIT ?`, [limit]);
    }
    /**
     * Execute multiple queries in a transaction
     */
    async executeTransaction(queries) {
        if (!this.db) {
            throw new Error('Database not connected');
        }
        await this.db.exec('BEGIN TRANSACTION');
        try {
            for (const query of queries) {
                await this.db.run(query.sql, query.params);
            }
            await this.db.exec('COMMIT');
        }
        catch (error) {
            await this.db.exec('ROLLBACK');
            throw error;
        }
    }
    /**
     * Analyze database structure and suggest migration mappings
     */
    async analyzeDatabaseStructure() {
        const tables = await this.getTableNames();
        const analysis = {
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
    generateSuggestedMapping(tableName, columns, sampleData) {
        const mapping = {
            entityType: tableName.toUpperCase(),
            sourceTable: tableName,
            keyMapping: {},
            fieldMapping: {},
        };
        // Find primary key column
        const pkColumn = columns.find(col => col.pk);
        if (pkColumn) {
            mapping.keyMapping.pk = (item) => `${tableName.toUpperCase()}#${item[pkColumn.name]}`;
            mapping.keyMapping.sk = () => 'METADATA';
        }
        // Map all columns to fields
        columns.forEach(column => {
            if (column.name !== 'id') {
                mapping.fieldMapping[column.name] = column.name;
            }
            else {
                mapping.fieldMapping[`${tableName}Id`] = 'id';
            }
        });
        // Add common transformations
        mapping.transformations = [
            {
                field: 'createdAt',
                transform: (value) => value ? new Date(value).toISOString() : new Date().toISOString(),
            },
            {
                field: 'updatedAt',
                transform: (value) => value ? new Date(value).toISOString() : new Date().toISOString(),
            },
        ];
        return mapping;
    }
    /**
     * Export table data to JSON for backup
     */
    async exportTableToJSON(tableName) {
        if (!this.db) {
            throw new Error('Database not connected');
        }
        return await this.db.all(`SELECT * FROM ${tableName}`);
    }
    /**
     * Get database file size
     */
    async getDatabaseSize() {
        const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
        try {
            const stats = await fs.stat(this.filePath);
            return stats.size;
        }
        catch (error) {
            return 0;
        }
    }
    /**
     * Vacuum database to optimize size
     */
    async vacuum() {
        if (!this.db) {
            throw new Error('Database not connected');
        }
        await this.db.exec('VACUUM');
    }
}
exports.SQLiteDataSource = SQLiteDataSource;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3FsaXRlLWRhdGEtc291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21pZ3JhdGlvbi9zcWxpdGUtZGF0YS1zb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0gsaURBQW1DO0FBQ25DLG1DQUF3QztBQUV4QyxNQUFhLGdCQUFnQjtJQUkzQixZQUFZLFFBQWdCO1FBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxPQUFPO1FBQ1gsSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLElBQUEsYUFBSSxFQUFDO1lBQ25CLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixNQUFNLEVBQUUsT0FBTyxDQUFDLFFBQVE7U0FDekIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLFVBQVU7UUFDZCxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNaLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUN0QixDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFXLEVBQUUsTUFBYztRQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCxJQUFJLENBQUM7WUFDSCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM5QyxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDNUMsTUFBTSxLQUFLLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLGFBQWE7UUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQzs7OztLQUloQyxDQUFDLENBQUM7UUFFSCxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFpQjtRQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQy9FLE9BQU8sTUFBTSxFQUFFLEtBQUssSUFBSSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLGNBQWMsQ0FBQyxTQUFpQjtRQU1wQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLHFCQUFxQixTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO1lBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO1lBQ2QsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEtBQUssQ0FBQztZQUMxQixFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDO1NBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBQ04sQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFpQjtRQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDOzs7S0FHaEMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFFaEIsT0FBTyxNQUFNLEtBQUssU0FBUyxDQUFDO0lBQzlCLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBaUIsRUFBRSxRQUFnQixFQUFFO1FBQ3ZELElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELE9BQU8sTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsU0FBUyxVQUFVLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxPQUErQztRQUN0RSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFFeEMsSUFBSSxDQUFDO1lBQ0gsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDNUIsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3QyxDQUFDO1lBQ0QsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDL0IsTUFBTSxLQUFLLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLHdCQUF3QjtRQWM1QixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUMxQyxNQUFNLFFBQVEsR0FBUTtZQUNwQixNQUFNLEVBQUUsRUFBRTtZQUNWLGlCQUFpQixFQUFFLEVBQUU7U0FDdEIsQ0FBQztRQUVGLEtBQUssTUFBTSxTQUFTLElBQUksTUFBTSxFQUFFLENBQUM7WUFDL0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyRCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTFELFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNuQixJQUFJLEVBQUUsU0FBUztnQkFDZixRQUFRO2dCQUNSLE9BQU87Z0JBQ1AsVUFBVTthQUNYLENBQUMsQ0FBQztZQUVILHNEQUFzRDtZQUN0RCxRQUFRLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDeEcsQ0FBQztRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFFRDs7T0FFRztJQUNLLHdCQUF3QixDQUFDLFNBQWlCLEVBQUUsT0FBYyxFQUFFLFVBQWlCO1FBQ25GLE1BQU0sT0FBTyxHQUFRO1lBQ25CLFVBQVUsRUFBRSxTQUFTLENBQUMsV0FBVyxFQUFFO1lBQ25DLFdBQVcsRUFBRSxTQUFTO1lBQ3RCLFVBQVUsRUFBRSxFQUFFO1lBQ2QsWUFBWSxFQUFFLEVBQUU7U0FDakIsQ0FBQztRQUVGLDBCQUEwQjtRQUMxQixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLElBQUksUUFBUSxFQUFFLENBQUM7WUFDYixPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQVMsRUFBRSxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzNGLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxHQUFHLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQztRQUMzQyxDQUFDO1FBRUQsNEJBQTRCO1FBQzVCLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDdkIsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUN6QixPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2xELENBQUM7aUJBQU0sQ0FBQztnQkFDTixPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsU0FBUyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDaEQsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsNkJBQTZCO1FBQzdCLE9BQU8sQ0FBQyxlQUFlLEdBQUc7WUFDeEI7Z0JBQ0UsS0FBSyxFQUFFLFdBQVc7Z0JBQ2xCLFNBQVMsRUFBRSxDQUFDLEtBQVUsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7YUFDNUY7WUFDRDtnQkFDRSxLQUFLLEVBQUUsV0FBVztnQkFDbEIsU0FBUyxFQUFFLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTthQUM1RjtTQUNGLENBQUM7UUFFRixPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsaUJBQWlCLENBQUMsU0FBaUI7UUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRUQsT0FBTyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLGlCQUFpQixTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxlQUFlO1FBQ25CLE1BQU0sRUFBRSxHQUFHLHdEQUFhLGFBQWEsR0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQztZQUNILE1BQU0sS0FBSyxHQUFHLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0MsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQ3BCLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTyxDQUFDLENBQUM7UUFDWCxDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLE1BQU07UUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9CLENBQUM7Q0FDRjtBQXRRRCw0Q0FzUUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFNRTGl0ZSBEYXRhIFNvdXJjZSBJbXBsZW1lbnRhdGlvblxuICogRGF0YSBzb3VyY2UgZm9yIG1pZ3JhdGluZyBmcm9tIFNRTGl0ZSBkYXRhYmFzZXNcbiAqL1xuXG5pbXBvcnQgeyBEYXRhU291cmNlIH0gZnJvbSAnLi9taWdyYXRpb24tc2VydmljZSc7XG5pbXBvcnQgKiBhcyBzcWxpdGUzIGZyb20gJ3NxbGl0ZTMnO1xuaW1wb3J0IHsgb3BlbiwgRGF0YWJhc2UgfSBmcm9tICdzcWxpdGUnO1xuXG5leHBvcnQgY2xhc3MgU1FMaXRlRGF0YVNvdXJjZSBpbXBsZW1lbnRzIERhdGFTb3VyY2Uge1xuICBwcml2YXRlIGRiPzogRGF0YWJhc2U8c3FsaXRlMy5EYXRhYmFzZSwgc3FsaXRlMy5TdGF0ZW1lbnQ+O1xuICBwcml2YXRlIGZpbGVQYXRoOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoZmlsZVBhdGg6IHN0cmluZykge1xuICAgIHRoaXMuZmlsZVBhdGggPSBmaWxlUGF0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25uZWN0IHRvIFNRTGl0ZSBkYXRhYmFzZVxuICAgKi9cbiAgYXN5bmMgY29ubmVjdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmRiID0gYXdhaXQgb3Blbih7XG4gICAgICBmaWxlbmFtZTogdGhpcy5maWxlUGF0aCxcbiAgICAgIGRyaXZlcjogc3FsaXRlMy5EYXRhYmFzZSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0IGZyb20gU1FMaXRlIGRhdGFiYXNlXG4gICAqL1xuICBhc3luYyBkaXNjb25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmRiKSB7XG4gICAgICBhd2FpdCB0aGlzLmRiLmNsb3NlKCk7XG4gICAgICB0aGlzLmRiID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIHF1ZXJ5IGFuZCByZXR1cm4gcmVzdWx0c1xuICAgKi9cbiAgYXN5bmMgcXVlcnkoc3FsOiBzdHJpbmcsIHBhcmFtcz86IGFueVtdKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgIGlmICghdGhpcy5kYikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhYmFzZSBub3QgY29ubmVjdGVkJyk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZGIuYWxsKHNxbCwgcGFyYW1zKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1NRTGl0ZSBxdWVyeSBlcnJvcjonLCBlcnJvcik7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCB0YWJsZSBuYW1lcyBpbiB0aGUgZGF0YWJhc2VcbiAgICovXG4gIGFzeW5jIGdldFRhYmxlTmFtZXMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGlmICghdGhpcy5kYikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhYmFzZSBub3QgY29ubmVjdGVkJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5kYi5hbGwoYFxuICAgICAgU0VMRUNUIG5hbWUgRlJPTSBzcWxpdGVfbWFzdGVyIFxuICAgICAgV0hFUkUgdHlwZT0ndGFibGUnIEFORCBuYW1lIE5PVCBMSUtFICdzcWxpdGVfJSdcbiAgICAgIE9SREVSIEJZIG5hbWVcbiAgICBgKTtcblxuICAgIHJldHVybiByZXN1bHQubWFwKHJvdyA9PiByb3cubmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHJvdyBjb3VudCBmb3IgYSB0YWJsZVxuICAgKi9cbiAgYXN5bmMgZ2V0Um93Q291bnQodGFibGVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmICghdGhpcy5kYikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhYmFzZSBub3QgY29ubmVjdGVkJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5kYi5nZXQoYFNFTEVDVCBDT1VOVCgqKSBhcyBjb3VudCBGUk9NICR7dGFibGVOYW1lfWApO1xuICAgIHJldHVybiByZXN1bHQ/LmNvdW50IHx8IDA7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRhYmxlIHNjaGVtYSBpbmZvcm1hdGlvblxuICAgKi9cbiAgYXN5bmMgZ2V0VGFibGVTY2hlbWEodGFibGVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgdHlwZTogc3RyaW5nO1xuICAgIG5vdG51bGw6IGJvb2xlYW47XG4gICAgcGs6IGJvb2xlYW47XG4gIH0+PiB7XG4gICAgaWYgKCF0aGlzLmRiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGFiYXNlIG5vdCBjb25uZWN0ZWQnKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmRiLmFsbChgUFJBR01BIHRhYmxlX2luZm8oJHt0YWJsZU5hbWV9KWApO1xuICAgIHJldHVybiByZXN1bHQubWFwKHJvdyA9PiAoe1xuICAgICAgbmFtZTogcm93Lm5hbWUsXG4gICAgICB0eXBlOiByb3cudHlwZSxcbiAgICAgIG5vdG51bGw6IHJvdy5ub3RudWxsID09PSAxLFxuICAgICAgcGs6IHJvdy5wayA9PT0gMSxcbiAgICB9KSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGFibGUgZXhpc3RzXG4gICAqL1xuICBhc3luYyB0YWJsZUV4aXN0cyh0YWJsZU5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmICghdGhpcy5kYikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhYmFzZSBub3QgY29ubmVjdGVkJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5kYi5nZXQoYFxuICAgICAgU0VMRUNUIG5hbWUgRlJPTSBzcWxpdGVfbWFzdGVyIFxuICAgICAgV0hFUkUgdHlwZT0ndGFibGUnIEFORCBuYW1lPT9cbiAgICBgLCBbdGFibGVOYW1lXSk7XG5cbiAgICByZXR1cm4gcmVzdWx0ICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHNhbXBsZSBkYXRhIGZyb20gdGFibGUgZm9yIGFuYWx5c2lzXG4gICAqL1xuICBhc3luYyBnZXRTYW1wbGVEYXRhKHRhYmxlTmFtZTogc3RyaW5nLCBsaW1pdDogbnVtYmVyID0gMTApOiBQcm9taXNlPGFueVtdPiB7XG4gICAgaWYgKCF0aGlzLmRiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGFiYXNlIG5vdCBjb25uZWN0ZWQnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5kYi5hbGwoYFNFTEVDVCAqIEZST00gJHt0YWJsZU5hbWV9IExJTUlUID9gLCBbbGltaXRdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIG11bHRpcGxlIHF1ZXJpZXMgaW4gYSB0cmFuc2FjdGlvblxuICAgKi9cbiAgYXN5bmMgZXhlY3V0ZVRyYW5zYWN0aW9uKHF1ZXJpZXM6IEFycmF5PHsgc3FsOiBzdHJpbmc7IHBhcmFtcz86IGFueVtdIH0+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmRiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGFiYXNlIG5vdCBjb25uZWN0ZWQnKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmRiLmV4ZWMoJ0JFR0lOIFRSQU5TQUNUSU9OJyk7XG5cbiAgICB0cnkge1xuICAgICAgZm9yIChjb25zdCBxdWVyeSBvZiBxdWVyaWVzKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuZGIucnVuKHF1ZXJ5LnNxbCwgcXVlcnkucGFyYW1zKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuZGIuZXhlYygnQ09NTUlUJyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGF3YWl0IHRoaXMuZGIuZXhlYygnUk9MTEJBQ0snKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbmFseXplIGRhdGFiYXNlIHN0cnVjdHVyZSBhbmQgc3VnZ2VzdCBtaWdyYXRpb24gbWFwcGluZ3NcbiAgICovXG4gIGFzeW5jIGFuYWx5emVEYXRhYmFzZVN0cnVjdHVyZSgpOiBQcm9taXNlPHtcbiAgICB0YWJsZXM6IEFycmF5PHtcbiAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgIHJvd0NvdW50OiBudW1iZXI7XG4gICAgICBjb2x1bW5zOiBBcnJheTx7XG4gICAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgICAgdHlwZTogc3RyaW5nO1xuICAgICAgICBub3RudWxsOiBib29sZWFuO1xuICAgICAgICBwazogYm9vbGVhbjtcbiAgICAgIH0+O1xuICAgICAgc2FtcGxlRGF0YTogYW55W107XG4gICAgfT47XG4gICAgc3VnZ2VzdGVkTWFwcGluZ3M6IFJlY29yZDxzdHJpbmcsIGFueT47XG4gIH0+IHtcbiAgICBjb25zdCB0YWJsZXMgPSBhd2FpdCB0aGlzLmdldFRhYmxlTmFtZXMoKTtcbiAgICBjb25zdCBhbmFseXNpczogYW55ID0ge1xuICAgICAgdGFibGVzOiBbXSxcbiAgICAgIHN1Z2dlc3RlZE1hcHBpbmdzOiB7fSxcbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCB0YWJsZU5hbWUgb2YgdGFibGVzKSB7XG4gICAgICBjb25zdCByb3dDb3VudCA9IGF3YWl0IHRoaXMuZ2V0Um93Q291bnQodGFibGVOYW1lKTtcbiAgICAgIGNvbnN0IGNvbHVtbnMgPSBhd2FpdCB0aGlzLmdldFRhYmxlU2NoZW1hKHRhYmxlTmFtZSk7XG4gICAgICBjb25zdCBzYW1wbGVEYXRhID0gYXdhaXQgdGhpcy5nZXRTYW1wbGVEYXRhKHRhYmxlTmFtZSwgNSk7XG5cbiAgICAgIGFuYWx5c2lzLnRhYmxlcy5wdXNoKHtcbiAgICAgICAgbmFtZTogdGFibGVOYW1lLFxuICAgICAgICByb3dDb3VudCxcbiAgICAgICAgY29sdW1ucyxcbiAgICAgICAgc2FtcGxlRGF0YSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBHZW5lcmF0ZSBzdWdnZXN0ZWQgbWFwcGluZyBiYXNlZCBvbiB0YWJsZSBzdHJ1Y3R1cmVcbiAgICAgIGFuYWx5c2lzLnN1Z2dlc3RlZE1hcHBpbmdzW3RhYmxlTmFtZV0gPSB0aGlzLmdlbmVyYXRlU3VnZ2VzdGVkTWFwcGluZyh0YWJsZU5hbWUsIGNvbHVtbnMsIHNhbXBsZURhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiBhbmFseXNpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBzdWdnZXN0ZWQgbWlncmF0aW9uIG1hcHBpbmcgZm9yIGEgdGFibGVcbiAgICovXG4gIHByaXZhdGUgZ2VuZXJhdGVTdWdnZXN0ZWRNYXBwaW5nKHRhYmxlTmFtZTogc3RyaW5nLCBjb2x1bW5zOiBhbnlbXSwgc2FtcGxlRGF0YTogYW55W10pOiBhbnkge1xuICAgIGNvbnN0IG1hcHBpbmc6IGFueSA9IHtcbiAgICAgIGVudGl0eVR5cGU6IHRhYmxlTmFtZS50b1VwcGVyQ2FzZSgpLFxuICAgICAgc291cmNlVGFibGU6IHRhYmxlTmFtZSxcbiAgICAgIGtleU1hcHBpbmc6IHt9LFxuICAgICAgZmllbGRNYXBwaW5nOiB7fSxcbiAgICB9O1xuXG4gICAgLy8gRmluZCBwcmltYXJ5IGtleSBjb2x1bW5cbiAgICBjb25zdCBwa0NvbHVtbiA9IGNvbHVtbnMuZmluZChjb2wgPT4gY29sLnBrKTtcbiAgICBpZiAocGtDb2x1bW4pIHtcbiAgICAgIG1hcHBpbmcua2V5TWFwcGluZy5wayA9IChpdGVtOiBhbnkpID0+IGAke3RhYmxlTmFtZS50b1VwcGVyQ2FzZSgpfSMke2l0ZW1bcGtDb2x1bW4ubmFtZV19YDtcbiAgICAgIG1hcHBpbmcua2V5TWFwcGluZy5zayA9ICgpID0+ICdNRVRBREFUQSc7XG4gICAgfVxuXG4gICAgLy8gTWFwIGFsbCBjb2x1bW5zIHRvIGZpZWxkc1xuICAgIGNvbHVtbnMuZm9yRWFjaChjb2x1bW4gPT4ge1xuICAgICAgaWYgKGNvbHVtbi5uYW1lICE9PSAnaWQnKSB7XG4gICAgICAgIG1hcHBpbmcuZmllbGRNYXBwaW5nW2NvbHVtbi5uYW1lXSA9IGNvbHVtbi5uYW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWFwcGluZy5maWVsZE1hcHBpbmdbYCR7dGFibGVOYW1lfUlkYF0gPSAnaWQnO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQWRkIGNvbW1vbiB0cmFuc2Zvcm1hdGlvbnNcbiAgICBtYXBwaW5nLnRyYW5zZm9ybWF0aW9ucyA9IFtcbiAgICAgIHtcbiAgICAgICAgZmllbGQ6ICdjcmVhdGVkQXQnLFxuICAgICAgICB0cmFuc2Zvcm06ICh2YWx1ZTogYW55KSA9PiB2YWx1ZSA/IG5ldyBEYXRlKHZhbHVlKS50b0lTT1N0cmluZygpIDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmllbGQ6ICd1cGRhdGVkQXQnLFxuICAgICAgICB0cmFuc2Zvcm06ICh2YWx1ZTogYW55KSA9PiB2YWx1ZSA/IG5ldyBEYXRlKHZhbHVlKS50b0lTT1N0cmluZygpIDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgfSxcbiAgICBdO1xuXG4gICAgcmV0dXJuIG1hcHBpbmc7XG4gIH1cblxuICAvKipcbiAgICogRXhwb3J0IHRhYmxlIGRhdGEgdG8gSlNPTiBmb3IgYmFja3VwXG4gICAqL1xuICBhc3luYyBleHBvcnRUYWJsZVRvSlNPTih0YWJsZU5hbWU6IHN0cmluZyk6IFByb21pc2U8YW55W10+IHtcbiAgICBpZiAoIXRoaXMuZGIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YWJhc2Ugbm90IGNvbm5lY3RlZCcpO1xuICAgIH1cblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmRiLmFsbChgU0VMRUNUICogRlJPTSAke3RhYmxlTmFtZX1gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZGF0YWJhc2UgZmlsZSBzaXplXG4gICAqL1xuICBhc3luYyBnZXREYXRhYmFzZVNpemUoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCBmcyA9IGF3YWl0IGltcG9ydCgnZnMvcHJvbWlzZXMnKTtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc3RhdHMgPSBhd2FpdCBmcy5zdGF0KHRoaXMuZmlsZVBhdGgpO1xuICAgICAgcmV0dXJuIHN0YXRzLnNpemU7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBWYWN1dW0gZGF0YWJhc2UgdG8gb3B0aW1pemUgc2l6ZVxuICAgKi9cbiAgYXN5bmMgdmFjdXVtKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5kYikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhYmFzZSBub3QgY29ubmVjdGVkJyk7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5kYi5leGVjKCdWQUNVVU0nKTtcbiAgfVxufSJdfQ==