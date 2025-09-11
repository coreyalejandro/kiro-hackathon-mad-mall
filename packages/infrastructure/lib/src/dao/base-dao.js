"use strict";
/**
 * Base DAO Implementation
 * Abstract base class for all DynamoDB DAOs with common CRUD operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDynamoDAO = void 0;
const database_1 = require("@madmall/shared-types/database");
class BaseDynamoDAO {
    constructor(dynamoService, entityType) {
        this.dynamoService = dynamoService;
        this.entityType = entityType;
    }
    /**
     * Create a new item with automatic timestamps and validation
     */
    async create(item) {
        const now = new Date().toISOString();
        const newItem = {
            ...item,
            entityType: this.entityType,
            version: 1,
            createdAt: now,
            updatedAt: now,
        };
        // Validate the item before creating
        const validation = this.validateEntity(newItem);
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        }
        // Check for duplicate key
        const exists = await this.exists(newItem.PK, newItem.SK);
        if (exists) {
            throw new Error(`Item with key PK=${newItem.PK}, SK=${newItem.SK} already exists`);
        }
        return await this.dynamoService.putItem(newItem);
    }
    /**
     * Get item by primary key
     */
    async getById(pk, sk, options) {
        return await this.dynamoService.getItem(pk, sk, options);
    }
    /**
     * Update an existing item with optimistic locking
     */
    async update(pk, sk, updates, options) {
        // Get current item for version check
        const currentItem = await this.getById(pk, sk);
        if (!currentItem) {
            throw new Error(`Item with key PK=${pk}, SK=${sk} not found`);
        }
        const now = new Date().toISOString();
        const newVersion = currentItem.version + 1;
        // Build update expression
        const updateExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};
        // Add updatedAt and version
        updateExpressions.push('#updatedAt = :updatedAt', '#version = :version');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeNames['#version'] = 'version';
        expressionAttributeValues[':updatedAt'] = now;
        expressionAttributeValues[':version'] = newVersion;
        expressionAttributeValues[':currentVersion'] = currentItem.version;
        // Add user-provided updates
        Object.entries(updates).forEach(([key, value], index) => {
            if (key !== 'createdAt' && key !== 'updatedAt' && key !== 'version' && key !== 'PK' && key !== 'SK') {
                const attrName = `#attr${index}`;
                const attrValue = `:val${index}`;
                updateExpressions.push(`${attrName} = ${attrValue}`);
                expressionAttributeNames[attrName] = key;
                expressionAttributeValues[attrValue] = value;
            }
        });
        const updateOptions = {
            updateExpression: `SET ${updateExpressions.join(', ')}`,
            conditionExpression: '#version = :currentVersion',
            expressionAttributeNames: {
                ...expressionAttributeNames,
                ...options?.expressionAttributeNames,
            },
            expressionAttributeValues: {
                ...expressionAttributeValues,
                ...options?.expressionAttributeValues,
            },
            returnValues: options?.returnValues || 'ALL_NEW',
        };
        if (options?.conditionExpression) {
            updateOptions.conditionExpression = `(${options.conditionExpression}) AND (#version = :currentVersion)`;
        }
        const updatedItem = await this.dynamoService.updateItem(pk, sk, updateOptions);
        // Validate updated item
        const validation = this.validateEntity(updatedItem);
        if (!validation.isValid) {
            throw new Error(`Updated item validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        }
        return updatedItem;
    }
    /**
     * Delete an item with optional conditions
     */
    async delete(pk, sk, options) {
        // Check if item exists
        const exists = await this.exists(pk, sk);
        if (!exists) {
            throw new Error(`Item with key PK=${pk}, SK=${sk} not found`);
        }
        await this.dynamoService.deleteItem(pk, sk, options);
    }
    /**
     * Query items with partition key
     */
    async query(pk, options) {
        const keyConditionExpression = 'PK = :pk';
        const expressionAttributeValues = { ':pk': pk };
        return await this.dynamoService.query(keyConditionExpression, {
            ...options,
            expressionAttributeValues: {
                ...expressionAttributeValues,
                ...options?.expressionAttributeValues,
            },
        });
    }
    /**
     * Query items using GSI
     */
    async queryGSI(indexName, pk, sk, options) {
        let keyConditionExpression = `${this.getGSIPartitionKey(indexName)} = :pk`;
        const expressionAttributeValues = { ':pk': pk };
        if (sk) {
            keyConditionExpression += ` AND ${this.getGSISortKey(indexName)} = :sk`;
            expressionAttributeValues[':sk'] = sk;
        }
        return await this.dynamoService.query(keyConditionExpression, {
            ...options,
            indexName,
            expressionAttributeValues: {
                ...expressionAttributeValues,
                ...options?.expressionAttributeValues,
            },
        });
    }
    /**
     * Batch get multiple items
     */
    async batchGet(keys, options) {
        // DynamoDB batch get limit is 100 items
        const batchSize = 100;
        const results = [];
        for (let i = 0; i < keys.length; i += batchSize) {
            const batch = keys.slice(i, i + batchSize);
            const batchResults = await this.dynamoService.batchGet(batch, options);
            results.push(...batchResults);
        }
        return results;
    }
    /**
     * Batch write multiple items
     */
    async batchWrite(items, options) {
        // Validate all items before writing
        for (const item of items) {
            const validation = this.validateEntity(item);
            if (!validation.isValid) {
                throw new Error(`Batch item validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
            }
        }
        // DynamoDB batch write limit is 25 items
        const batchSize = 25;
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            await this.dynamoService.batchWrite(batch, 'put', options);
        }
    }
    /**
     * Execute transaction
     */
    async transaction(items) {
        // DynamoDB transaction limit is 25 items
        if (items.length > 25) {
            throw new Error('Transaction cannot contain more than 25 items');
        }
        await this.dynamoService.transaction(items);
    }
    /**
     * Check if item exists
     */
    async exists(pk, sk) {
        return await this.dynamoService.exists(pk, sk);
    }
    /**
     * Get item count for partition
     */
    async count(pk, options) {
        const keyConditionExpression = 'PK = :pk';
        return await this.dynamoService.count(keyConditionExpression, {
            ...options,
            expressionAttributeValues: { ':pk': pk },
        });
    }
    /**
     * Validate entity using appropriate validator
     */
    validateEntity(entity) {
        // First validate DynamoDB key structure
        const keyValidation = database_1.DataValidator.validateKeys(entity);
        if (!keyValidation.isValid) {
            return keyValidation;
        }
        // Then validate consistency
        const consistencyValidation = database_1.DataValidator.validateConsistency(entity);
        if (!consistencyValidation.isValid) {
            return consistencyValidation;
        }
        // Entity-specific validation should be implemented in subclasses
        return this.validateEntitySpecific(entity);
    }
    /**
     * Get GSI partition key attribute name
     */
    getGSIPartitionKey(indexName) {
        switch (indexName) {
            case 'GSI1':
                return 'GSI1PK';
            case 'GSI2':
                return 'GSI2PK';
            case 'GSI3':
                return 'GSI3PK';
            case 'GSI4':
                return 'GSI4PK';
            default:
                throw new Error(`Unknown GSI: ${indexName}`);
        }
    }
    /**
     * Get GSI sort key attribute name
     */
    getGSISortKey(indexName) {
        switch (indexName) {
            case 'GSI1':
                return 'GSI1SK';
            case 'GSI2':
                return 'GSI2SK';
            case 'GSI3':
                return 'GSI3SK';
            case 'GSI4':
                return 'GSI4SK';
            default:
                throw new Error(`Unknown GSI: ${indexName}`);
        }
    }
    /**
     * Build filter expression for array contains
     */
    buildContainsFilter(attribute, values) {
        const filterExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};
        values.forEach((value, index) => {
            const attrName = `#${attribute.replace('.', '_')}`;
            const attrValue = `:${attribute.replace('.', '_')}_${index}`;
            filterExpressions.push(`contains(${attrName}, ${attrValue})`);
            expressionAttributeNames[attrName] = attribute;
            expressionAttributeValues[attrValue] = value;
        });
        return {
            filterExpression: filterExpressions.join(' OR '),
            expressionAttributeNames,
            expressionAttributeValues,
        };
    }
    /**
     * Build IN filter expression
     */
    buildInFilter(attribute, values) {
        const attrName = `#${attribute.replace('.', '_')}`;
        const expressionAttributeNames = { [attrName]: attribute };
        const expressionAttributeValues = {};
        const valueRefs = values.map((value, index) => {
            const attrValue = `:${attribute.replace('.', '_')}_${index}`;
            expressionAttributeValues[attrValue] = value;
            return attrValue;
        });
        return {
            filterExpression: `${attrName} IN (${valueRefs.join(', ')})`,
            expressionAttributeNames,
            expressionAttributeValues,
        };
    }
    /**
     * Merge query options with additional filters
     */
    mergeQueryOptions(baseOptions = {}, additionalFilters) {
        const mergedOptions = { ...baseOptions };
        if (additionalFilters.filterExpression) {
            if (mergedOptions.filterExpression) {
                mergedOptions.filterExpression = `(${mergedOptions.filterExpression}) AND (${additionalFilters.filterExpression})`;
            }
            else {
                mergedOptions.filterExpression = additionalFilters.filterExpression;
            }
        }
        if (additionalFilters.expressionAttributeNames) {
            mergedOptions.expressionAttributeNames = {
                ...mergedOptions.expressionAttributeNames,
                ...additionalFilters.expressionAttributeNames,
            };
        }
        if (additionalFilters.expressionAttributeValues) {
            mergedOptions.expressionAttributeValues = {
                ...mergedOptions.expressionAttributeValues,
                ...additionalFilters.expressionAttributeValues,
            };
        }
        return mergedOptions;
    }
}
exports.BaseDynamoDAO = BaseDynamoDAO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGFvL2Jhc2UtZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7OztBQWNILDZEQUFpRjtBQUVqRixNQUFzQixhQUFhO0lBSWpDLFlBQVksYUFBOEIsRUFBRSxVQUFrQjtRQUM1RCxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztRQUNuQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUMvQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLElBQW9EO1FBQy9ELE1BQU0sR0FBRyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDckMsTUFBTSxPQUFPLEdBQUc7WUFDZCxHQUFHLElBQUk7WUFDUCxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7WUFDM0IsT0FBTyxFQUFFLENBQUM7WUFDVixTQUFTLEVBQUUsR0FBRztZQUNkLFNBQVMsRUFBRSxHQUFHO1NBQ1YsQ0FBQztRQUVQLG9DQUFvQztRQUNwQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1RixDQUFDO1FBRUQsMEJBQTBCO1FBQzFCLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RCxJQUFJLE1BQU0sRUFBRSxDQUFDO1lB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QUFDO1FBQ0osQ0FBQztRQUVELE9BQU8sYUFBYSxDQUFDO0lBQ3ZCLENBQUM7Q0FDRjtBQTNYRCxzQ0EyWEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEJhc2UgREFPIEltcGxlbWVudGF0aW9uXG4gKiBBYnN0cmFjdCBiYXNlIGNsYXNzIGZvciBhbGwgRHluYW1vREIgREFPcyB3aXRoIGNvbW1vbiBDUlVEIG9wZXJhdGlvbnNcbiAqL1xuXG5pbXBvcnQgeyBEeW5hbW9EQlNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9keW5hbW9kYi1zZXJ2aWNlJztcbmltcG9ydCB7IFxuICBCYXNlREFPLCBcbiAgUXVlcnlPcHRpb25zLCBcbiAgUXVlcnlSZXN1bHQsIFxuICBCYXRjaEdldE9wdGlvbnMsIFxuICBCYXRjaFdyaXRlT3B0aW9ucywgXG4gIFVwZGF0ZU9wdGlvbnMsIFxuICBEZWxldGVPcHRpb25zLCBcbiAgVHJhbnNhY3Rpb25JdGVtIFxufSBmcm9tICdAbWFkbWFsbC9zaGFyZWQtdHlwZXMvZGF0YWJhc2UnO1xuaW1wb3J0IHsgQmFzZUVudGl0eSB9IGZyb20gJ0BtYWRtYWxsL3NoYXJlZC10eXBlcy9kYXRhYmFzZSc7XG5pbXBvcnQgeyBEYXRhVmFsaWRhdG9yLCBWYWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnQG1hZG1hbGwvc2hhcmVkLXR5cGVzL2RhdGFiYXNlJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VEeW5hbW9EQU88VCBleHRlbmRzIEJhc2VFbnRpdHk+IGltcGxlbWVudHMgQmFzZURBTzxUPiB7XG4gIHByb3RlY3RlZCBkeW5hbW9TZXJ2aWNlOiBEeW5hbW9EQlNlcnZpY2U7XG4gIHByb3RlY3RlZCBlbnRpdHlUeXBlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoZHluYW1vU2VydmljZTogRHluYW1vREJTZXJ2aWNlLCBlbnRpdHlUeXBlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmR5bmFtb1NlcnZpY2UgPSBkeW5hbW9TZXJ2aWNlO1xuICAgIHRoaXMuZW50aXR5VHlwZSA9IGVudGl0eVR5cGU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGl0ZW0gd2l0aCBhdXRvbWF0aWMgdGltZXN0YW1wcyBhbmQgdmFsaWRhdGlvblxuICAgKi9cbiAgYXN5bmMgY3JlYXRlKGl0ZW06IE9taXQ8VCwgJ2NyZWF0ZWRBdCcgfCAndXBkYXRlZEF0JyB8ICd2ZXJzaW9uJz4pOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgY29uc3QgbmV3SXRlbSA9IHtcbiAgICAgIC4uLml0ZW0sXG4gICAgICBlbnRpdHlUeXBlOiB0aGlzLmVudGl0eVR5cGUsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAgY3JlYXRlZEF0OiBub3csXG4gICAgICB1cGRhdGVkQXQ6IG5vdyxcbiAgICB9IGFzIFQ7XG5cbiAgICAvLyBWYWxpZGF0ZSB0aGUgaXRlbSBiZWZvcmUgY3JlYXRpbmdcbiAgICBjb25zdCB2YWxpZGF0aW9uID0gdGhpcy52YWxpZGF0ZUVudGl0eShuZXdJdGVtKTtcbiAgICBpZiAoIXZhbGlkYXRpb24uaXNWYWxpZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBWYWxpZGF0aW9uIGZhaWxlZDogJHt2YWxpZGF0aW9uLmVycm9ycy5tYXAoZSA9PiBlLm1lc3NhZ2UpLmpvaW4oJywgJyl9YCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGR1cGxpY2F0ZSBrZXlcbiAgICBjb25zdCBleGlzdHMgPSBhd2FpdCB0aGlzLmV4aXN0cyhuZXdJdGVtLlBLLCBuZXdJdGVtLlNLKTtcbiAgICBpZiAoZXhpc3RzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEl0ZW0gd2l0aCBrZXkgUEs9JHtuZXdJdGVtLlBLfSwgU0s9JHtuZXdJdGVtLlNLfSBhbHJlYWR5IGV4aXN0c2ApO1xuICAgIH1cblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmR5bmFtb1NlcnZpY2UucHV0SXRlbShuZXdJdGVtKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgaXRlbSBieSBwcmltYXJ5IGtleVxuICAgKi9cbiAgYXN5bmMgZ2V0QnlJZChwazogc3RyaW5nLCBzazogc3RyaW5nLCBvcHRpb25zPzogUXVlcnlPcHRpb25zKTogUHJvbWlzZTxUIHwgbnVsbD4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmR5bmFtb1NlcnZpY2UuZ2V0SXRlbTxUPihwaywgc2ssIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBhbiBleGlzdGluZyBpdGVtIHdpdGggb3B0aW1pc3RpYyBsb2NraW5nXG4gICAqL1xuICBhc3luYyB1cGRhdGUocGs6IHN0cmluZywgc2s6IHN0cmluZywgdXBkYXRlczogUGFydGlhbDxUPiwgb3B0aW9ucz86IFVwZGF0ZU9wdGlvbnMpOiBQcm9taXNlPFQ+IHtcbiAgICAvLyBHZXQgY3VycmVudCBpdGVtIGZvciB2ZXJzaW9uIGNoZWNrXG4gICAgY29uc3QgY3VycmVudEl0ZW0gPSBhd2FpdCB0aGlzLmdldEJ5SWQocGssIHNrKTtcbiAgICBpZiAoIWN1cnJlbnRJdGVtKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEl0ZW0gd2l0aCBrZXkgUEs9JHtwa30sIFNLPSR7c2t9IG5vdCBmb3VuZGApO1xuICAgIH1cblxuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gY3VycmVudEl0ZW0udmVyc2lvbiArIDE7XG5cbiAgICAvLyBCdWlsZCB1cGRhdGUgZXhwcmVzc2lvblxuICAgIGNvbnN0IHVwZGF0ZUV4cHJlc3Npb25zOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICAgIGNvbnN0IGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcblxuICAgIC8vIEFkZCB1cGRhdGVkQXQgYW5kIHZlcnNpb25cbiAgICB1cGRhdGVFeHByZXNzaW9ucy5wdXNoKCcjdXBkYXRlZEF0ID0gOnVwZGF0ZWRBdCcsICcjdmVyc2lvbiA9IDp2ZXJzaW9uJyk7XG4gICAgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzWycjdXBkYXRlZEF0J10gPSAndXBkYXRlZEF0JztcbiAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXNbJyN2ZXJzaW9uJ10gPSAndmVyc2lvbic7XG4gICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlc1snOnVwZGF0ZWRBdCddID0gbm93O1xuICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbJzp2ZXJzaW9uJ10gPSBuZXdWZXJzaW9uO1xuICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbJzpjdXJyZW50VmVyc2lvbiddID0gY3VycmVudEl0ZW0udmVyc2lvbjtcblxuICAgIC8vIEFkZCB1c2VyLXByb3ZpZGVkIHVwZGF0ZXNcbiAgICBPYmplY3QuZW50cmllcyh1cGRhdGVzKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0sIGluZGV4KSA9PiB7XG4gICAgICBpZiAoa2V5ICE9PSAnY3JlYXRlZEF0JyAmJiBrZXkgIT09ICd1cGRhdGVkQXQnICYmIGtleSAhPT0gJ3ZlcnNpb24nICYmIGtleSAhPT0gJ1BLJyAmJiBrZXkgIT09ICdTSycpIHtcbiAgICAgICAgY29uc3QgYXR0ck5hbWUgPSBgI2F0dHIke2luZGV4fWA7XG4gICAgICAgIGNvbnN0IGF0dHJWYWx1ZSA9IGA6dmFsJHtpbmRleH1gO1xuICAgICAgICB1cGRhdGVFeHByZXNzaW9ucy5wdXNoKGAke2F0dHJOYW1lfSA9ICR7YXR0clZhbHVlfWApO1xuICAgICAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXNbYXR0ck5hbWVdID0ga2V5O1xuICAgICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzW2F0dHJWYWx1ZV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IHVwZGF0ZU9wdGlvbnM6IFVwZGF0ZU9wdGlvbnMgPSB7XG4gICAgICB1cGRhdGVFeHByZXNzaW9uOiBgU0VUICR7dXBkYXRlRXhwcmVzc2lvbnMuam9pbignLCAnKX1gLFxuICAgICAgY29uZGl0aW9uRXhwcmVzc2lvbjogJyN2ZXJzaW9uID0gOmN1cnJlbnRWZXJzaW9uJyxcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAuLi5leHByZXNzaW9uQXR0cmlidXRlTmFtZXMsXG4gICAgICAgIC4uLm9wdGlvbnM/LmV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcyxcbiAgICAgIH0sXG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgIC4uLmV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXMsXG4gICAgICAgIC4uLm9wdGlvbnM/LmV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXMsXG4gICAgICB9LFxuICAgICAgcmV0dXJuVmFsdWVzOiBvcHRpb25zPy5yZXR1cm5WYWx1ZXMgfHwgJ0FMTF9ORVcnLFxuICAgIH07XG5cbiAgICBpZiAob3B0aW9ucz8uY29uZGl0aW9uRXhwcmVzc2lvbikge1xuICAgICAgdXBkYXRlT3B0aW9ucy5jb25kaXRpb25FeHByZXNzaW9uID0gYCgke29wdGlvbnMuY29uZGl0aW9uRXhwcmVzc2lvbn0pIEFORCAoI3ZlcnNpb24gPSA6Y3VycmVudFZlcnNpb24pYDtcbiAgICB9XG5cbiAgICBjb25zdCB1cGRhdGVkSXRlbSA9IGF3YWl0IHRoaXMuZHluYW1vU2VydmljZS51cGRhdGVJdGVtPFQ+KHBrLCBzaywgdXBkYXRlT3B0aW9ucyk7XG5cbiAgICAvLyBWYWxpZGF0ZSB1cGRhdGVkIGl0ZW1cbiAgICBjb25zdCB2YWxpZGF0aW9uID0gdGhpcy52YWxpZGF0ZUVudGl0eSh1cGRhdGVkSXRlbSk7XG4gICAgaWYgKCF2YWxpZGF0aW9uLmlzVmFsaWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVXBkYXRlZCBpdGVtIHZhbGlkYXRpb24gZmFpbGVkOiAke3ZhbGlkYXRpb24uZXJyb3JzLm1hcChlID0+IGUubWVzc2FnZSkuam9pbignLCAnKX1gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdXBkYXRlZEl0ZW07XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIGFuIGl0ZW0gd2l0aCBvcHRpb25hbCBjb25kaXRpb25zXG4gICAqL1xuICBhc3luYyBkZWxldGUocGs6IHN0cmluZywgc2s6IHN0cmluZywgb3B0aW9ucz86IERlbGV0ZU9wdGlvbnMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBDaGVjayBpZiBpdGVtIGV4aXN0c1xuICAgIGNvbnN0IGV4aXN0cyA9IGF3YWl0IHRoaXMuZXhpc3RzKHBrLCBzayk7XG4gICAgaWYgKCFleGlzdHMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSXRlbSB3aXRoIGtleSBQSz0ke3BrfSwgU0s9JHtza30gbm90IGZvdW5kYCk7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5keW5hbW9TZXJ2aWNlLmRlbGV0ZUl0ZW0ocGssIHNrLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBRdWVyeSBpdGVtcyB3aXRoIHBhcnRpdGlvbiBrZXlcbiAgICovXG4gIGFzeW5jIHF1ZXJ5KHBrOiBzdHJpbmcsIG9wdGlvbnM/OiBRdWVyeU9wdGlvbnMpOiBQcm9taXNlPFF1ZXJ5UmVzdWx0PFQ+PiB7XG4gICAgY29uc3Qga2V5Q29uZGl0aW9uRXhwcmVzc2lvbiA9ICdQSyA9IDpwayc7XG4gICAgY29uc3QgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyA9IHsgJzpwayc6IHBrIH07XG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5keW5hbW9TZXJ2aWNlLnF1ZXJ5PFQ+KGtleUNvbmRpdGlvbkV4cHJlc3Npb24sIHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgIC4uLmV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXMsXG4gICAgICAgIC4uLm9wdGlvbnM/LmV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXMsXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFF1ZXJ5IGl0ZW1zIHVzaW5nIEdTSVxuICAgKi9cbiAgYXN5bmMgcXVlcnlHU0koaW5kZXhOYW1lOiBzdHJpbmcsIHBrOiBzdHJpbmcsIHNrPzogc3RyaW5nLCBvcHRpb25zPzogUXVlcnlPcHRpb25zKTogUHJvbWlzZTxRdWVyeVJlc3VsdDxUPj4ge1xuICAgIGxldCBrZXlDb25kaXRpb25FeHByZXNzaW9uID0gYCR7dGhpcy5nZXRHU0lQYXJ0aXRpb25LZXkoaW5kZXhOYW1lKX0gPSA6cGtgO1xuICAgIGNvbnN0IGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7ICc6cGsnOiBwayB9O1xuXG4gICAgaWYgKHNrKSB7XG4gICAgICBrZXlDb25kaXRpb25FeHByZXNzaW9uICs9IGAgQU5EICR7dGhpcy5nZXRHU0lTb3J0S2V5KGluZGV4TmFtZSl9ID0gOnNrYDtcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbJzpzayddID0gc2s7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZHluYW1vU2VydmljZS5xdWVyeTxUPihrZXlDb25kaXRpb25FeHByZXNzaW9uLCB7XG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgaW5kZXhOYW1lLFxuICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAuLi5leHByZXNzaW9uQXR0cmlidXRlVmFsdWVzLFxuICAgICAgICAuLi5vcHRpb25zPy5leHByZXNzaW9uQXR0cmlidXRlVmFsdWVzLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCYXRjaCBnZXQgbXVsdGlwbGUgaXRlbXNcbiAgICovXG4gIGFzeW5jIGJhdGNoR2V0KGtleXM6IEFycmF5PHsgcGs6IHN0cmluZzsgc2s6IHN0cmluZyB9Piwgb3B0aW9ucz86IEJhdGNoR2V0T3B0aW9ucyk6IFByb21pc2U8VFtdPiB7XG4gICAgLy8gRHluYW1vREIgYmF0Y2ggZ2V0IGxpbWl0IGlzIDEwMCBpdGVtc1xuICAgIGNvbnN0IGJhdGNoU2l6ZSA9IDEwMDtcbiAgICBjb25zdCByZXN1bHRzOiBUW10gPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkgKz0gYmF0Y2hTaXplKSB7XG4gICAgICBjb25zdCBiYXRjaCA9IGtleXMuc2xpY2UoaSwgaSArIGJhdGNoU2l6ZSk7XG4gICAgICBjb25zdCBiYXRjaFJlc3VsdHMgPSBhd2FpdCB0aGlzLmR5bmFtb1NlcnZpY2UuYmF0Y2hHZXQ8VD4oYmF0Y2gsIG9wdGlvbnMpO1xuICAgICAgcmVzdWx0cy5wdXNoKC4uLmJhdGNoUmVzdWx0cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvKipcbiAgICogQmF0Y2ggd3JpdGUgbXVsdGlwbGUgaXRlbXNcbiAgICovXG4gIGFzeW5jIGJhdGNoV3JpdGUoaXRlbXM6IFRbXSwgb3B0aW9ucz86IEJhdGNoV3JpdGVPcHRpb25zKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gVmFsaWRhdGUgYWxsIGl0ZW1zIGJlZm9yZSB3cml0aW5nXG4gICAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgICBjb25zdCB2YWxpZGF0aW9uID0gdGhpcy52YWxpZGF0ZUVudGl0eShpdGVtKTtcbiAgICAgIGlmICghdmFsaWRhdGlvbi5pc1ZhbGlkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQmF0Y2ggaXRlbSB2YWxpZGF0aW9uIGZhaWxlZDogJHt2YWxpZGF0aW9uLmVycm9ycy5tYXAoZSA9PiBlLm1lc3NhZ2UpLmpvaW4oJywgJyl9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRHluYW1vREIgYmF0Y2ggd3JpdGUgbGltaXQgaXMgMjUgaXRlbXNcbiAgICBjb25zdCBiYXRjaFNpemUgPSAyNTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpICs9IGJhdGNoU2l6ZSkge1xuICAgICAgY29uc3QgYmF0Y2ggPSBpdGVtcy5zbGljZShpLCBpICsgYmF0Y2hTaXplKTtcbiAgICAgIGF3YWl0IHRoaXMuZHluYW1vU2VydmljZS5iYXRjaFdyaXRlKGJhdGNoLCAncHV0Jywgb3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGUgdHJhbnNhY3Rpb25cbiAgICovXG4gIGFzeW5jIHRyYW5zYWN0aW9uKGl0ZW1zOiBUcmFuc2FjdGlvbkl0ZW1bXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIER5bmFtb0RCIHRyYW5zYWN0aW9uIGxpbWl0IGlzIDI1IGl0ZW1zXG4gICAgaWYgKGl0ZW1zLmxlbmd0aCA+IDI1KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyYW5zYWN0aW9uIGNhbm5vdCBjb250YWluIG1vcmUgdGhhbiAyNSBpdGVtcycpO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuZHluYW1vU2VydmljZS50cmFuc2FjdGlvbihpdGVtcyk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgaXRlbSBleGlzdHNcbiAgICovXG4gIGFzeW5jIGV4aXN0cyhwazogc3RyaW5nLCBzazogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZHluYW1vU2VydmljZS5leGlzdHMocGssIHNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgaXRlbSBjb3VudCBmb3IgcGFydGl0aW9uXG4gICAqL1xuICBhc3luYyBjb3VudChwazogc3RyaW5nLCBvcHRpb25zPzogUXVlcnlPcHRpb25zKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCBrZXlDb25kaXRpb25FeHByZXNzaW9uID0gJ1BLID0gOnBrJztcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5keW5hbW9TZXJ2aWNlLmNvdW50KGtleUNvbmRpdGlvbkV4cHJlc3Npb24sIHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7ICc6cGsnOiBwayB9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIGVudGl0eSB1c2luZyBhcHByb3ByaWF0ZSB2YWxpZGF0b3JcbiAgICovXG4gIHByb3RlY3RlZCB2YWxpZGF0ZUVudGl0eShlbnRpdHk6IFQpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgICAvLyBGaXJzdCB2YWxpZGF0ZSBEeW5hbW9EQiBrZXkgc3RydWN0dXJlXG4gICAgY29uc3Qga2V5VmFsaWRhdGlvbiA9IERhdGFWYWxpZGF0b3IudmFsaWRhdGVLZXlzKGVudGl0eSk7XG4gICAgaWYgKCFrZXlWYWxpZGF0aW9uLmlzVmFsaWQpIHtcbiAgICAgIHJldHVybiBrZXlWYWxpZGF0aW9uO1xuICAgIH1cblxuICAgIC8vIFRoZW4gdmFsaWRhdGUgY29uc2lzdGVuY3lcbiAgICBjb25zdCBjb25zaXN0ZW5jeVZhbGlkYXRpb24gPSBEYXRhVmFsaWRhdG9yLnZhbGlkYXRlQ29uc2lzdGVuY3koZW50aXR5KTtcbiAgICBpZiAoIWNvbnNpc3RlbmN5VmFsaWRhdGlvbi5pc1ZhbGlkKSB7XG4gICAgICByZXR1cm4gY29uc2lzdGVuY3lWYWxpZGF0aW9uO1xuICAgIH1cblxuICAgIC8vIEVudGl0eS1zcGVjaWZpYyB2YWxpZGF0aW9uIHNob3VsZCBiZSBpbXBsZW1lbnRlZCBpbiBzdWJjbGFzc2VzXG4gICAgcmV0dXJuIHRoaXMudmFsaWRhdGVFbnRpdHlTcGVjaWZpYyhlbnRpdHkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVudGl0eS1zcGVjaWZpYyB2YWxpZGF0aW9uIC0gdG8gYmUgaW1wbGVtZW50ZWQgYnkgc3ViY2xhc3Nlc1xuICAgKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IHZhbGlkYXRlRW50aXR5U3BlY2lmaWMoZW50aXR5OiBUKTogVmFsaWRhdGlvblJlc3VsdDtcblxuICAvKipcbiAgICogR2V0IEdTSSBwYXJ0aXRpb24ga2V5IGF0dHJpYnV0ZSBuYW1lXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0R1NJUGFydGl0aW9uS2V5KGluZGV4TmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBzd2l0Y2ggKGluZGV4TmFtZSkge1xuICAgICAgY2FzZSAnR1NJMSc6XG4gICAgICAgIHJldHVybiAnR1NJMVBLJztcbiAgICAgIGNhc2UgJ0dTSTInOlxuICAgICAgICByZXR1cm4gJ0dTSTJQSyc7XG4gICAgICBjYXNlICdHU0kzJzpcbiAgICAgICAgcmV0dXJuICdHU0kzUEsnO1xuICAgICAgY2FzZSAnR1NJNCc6XG4gICAgICAgIHJldHVybiAnR1NJNFBLJztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBHU0k6ICR7aW5kZXhOYW1lfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgR1NJIHNvcnQga2V5IGF0dHJpYnV0ZSBuYW1lXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0R1NJU29ydEtleShpbmRleE5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgc3dpdGNoIChpbmRleE5hbWUpIHtcbiAgICAgIGNhc2UgJ0dTSTEnOlxuICAgICAgICByZXR1cm4gJ0dTSTFTSyc7XG4gICAgICBjYXNlICdHU0kyJzpcbiAgICAgICAgcmV0dXJuICdHU0kyU0snO1xuICAgICAgY2FzZSAnR1NJMyc6XG4gICAgICAgIHJldHVybiAnR1NJM1NLJztcbiAgICAgIGNhc2UgJ0dTSTQnOlxuICAgICAgICByZXR1cm4gJ0dTSTRTSyc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gR1NJOiAke2luZGV4TmFtZX1gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgZmlsdGVyIGV4cHJlc3Npb24gZm9yIGFycmF5IGNvbnRhaW5zXG4gICAqL1xuICBwcm90ZWN0ZWQgYnVpbGRDb250YWluc0ZpbHRlcihhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWVzOiBzdHJpbmdbXSk6IHtcbiAgICBmaWx0ZXJFeHByZXNzaW9uOiBzdHJpbmc7XG4gICAgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IFJlY29yZDxzdHJpbmcsIGFueT47XG4gIH0ge1xuICAgIGNvbnN0IGZpbHRlckV4cHJlc3Npb25zOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICAgIGNvbnN0IGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcblxuICAgIHZhbHVlcy5mb3JFYWNoKCh2YWx1ZSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGF0dHJOYW1lID0gYCMke2F0dHJpYnV0ZS5yZXBsYWNlKCcuJywgJ18nKX1gO1xuICAgICAgY29uc3QgYXR0clZhbHVlID0gYDoke2F0dHJpYnV0ZS5yZXBsYWNlKCcuJywgJ18nKX1fJHtpbmRleH1gO1xuICAgICAgZmlsdGVyRXhwcmVzc2lvbnMucHVzaChgY29udGFpbnMoJHthdHRyTmFtZX0sICR7YXR0clZhbHVlfSlgKTtcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lc1thdHRyTmFtZV0gPSBhdHRyaWJ1dGU7XG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzW2F0dHJWYWx1ZV0gPSB2YWx1ZTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBmaWx0ZXJFeHByZXNzaW9uOiBmaWx0ZXJFeHByZXNzaW9ucy5qb2luKCcgT1IgJyksXG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXMsXG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgSU4gZmlsdGVyIGV4cHJlc3Npb25cbiAgICovXG4gIHByb3RlY3RlZCBidWlsZEluRmlsdGVyKGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZXM6IGFueVtdKToge1xuICAgIGZpbHRlckV4cHJlc3Npb246IHN0cmluZztcbiAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgfSB7XG4gICAgY29uc3QgYXR0ck5hbWUgPSBgIyR7YXR0cmlidXRlLnJlcGxhY2UoJy4nLCAnXycpfWA7XG4gICAgY29uc3QgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0geyBbYXR0ck5hbWVdOiBhdHRyaWJ1dGUgfTtcbiAgICBjb25zdCBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG4gICAgXG4gICAgY29uc3QgdmFsdWVSZWZzID0gdmFsdWVzLm1hcCgodmFsdWUsIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBhdHRyVmFsdWUgPSBgOiR7YXR0cmlidXRlLnJlcGxhY2UoJy4nLCAnXycpfV8ke2luZGV4fWA7XG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzW2F0dHJWYWx1ZV0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiBhdHRyVmFsdWU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZmlsdGVyRXhwcmVzc2lvbjogYCR7YXR0ck5hbWV9IElOICgke3ZhbHVlUmVmcy5qb2luKCcsICcpfSlgLFxuICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzLFxuICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlIHF1ZXJ5IG9wdGlvbnMgd2l0aCBhZGRpdGlvbmFsIGZpbHRlcnNcbiAgICovXG4gIHByb3RlY3RlZCBtZXJnZVF1ZXJ5T3B0aW9ucyhcbiAgICBiYXNlT3B0aW9uczogUXVlcnlPcHRpb25zID0ge30sXG4gICAgYWRkaXRpb25hbEZpbHRlcnM6IHtcbiAgICAgIGZpbHRlckV4cHJlc3Npb24/OiBzdHJpbmc7XG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcz86IFJlY29yZDxzdHJpbmcsIGFueT47XG4gICAgfVxuICApOiBRdWVyeU9wdGlvbnMge1xuICAgIGNvbnN0IG1lcmdlZE9wdGlvbnM6IFF1ZXJ5T3B0aW9ucyA9IHsgLi4uYmFzZU9wdGlvbnMgfTtcblxuICAgIGlmIChhZGRpdGlvbmFsRmlsdGVycy5maWx0ZXJFeHByZXNzaW9uKSB7XG4gICAgICBpZiAobWVyZ2VkT3B0aW9ucy5maWx0ZXJFeHByZXNzaW9uKSB7XG4gICAgICAgIG1lcmdlZE9wdGlvbnMuZmlsdGVyRXhwcmVzc2lvbiA9IGAoJHttZXJnZWRPcHRpb25zLmZpbHRlckV4cHJlc3Npb259KSBBTkQgKCR7YWRkaXRpb25hbEZpbHRlcnMuZmlsdGVyRXhwcmVzc2lvbn0pYDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1lcmdlZE9wdGlvbnMuZmlsdGVyRXhwcmVzc2lvbiA9IGFkZGl0aW9uYWxGaWx0ZXJzLmZpbHRlckV4cHJlc3Npb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGFkZGl0aW9uYWxGaWx0ZXJzLmV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcykge1xuICAgICAgbWVyZ2VkT3B0aW9ucy5leHByZXNzaW9uQXR0cmlidXRlTmFtZXMgPSB7XG4gICAgICAgIC4uLm1lcmdlZE9wdGlvbnMuZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzLFxuICAgICAgICAuLi5hZGRpdGlvbmFsRmlsdGVycy5leHByZXNzaW9uQXR0cmlidXRlTmFtZXMsXG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmIChhZGRpdGlvbmFsRmlsdGVycy5leHByZXNzaW9uQXR0cmlidXRlVmFsdWVzKSB7XG4gICAgICBtZXJnZWRPcHRpb25zLmV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXMgPSB7XG4gICAgICAgIC4uLm1lcmdlZE9wdGlvbnMuZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyxcbiAgICAgICAgLi4uYWRkaXRpb25hbEZpbHRlcnMuZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lcmdlZE9wdGlvbnM7XG4gIH1cbn0iXX0=