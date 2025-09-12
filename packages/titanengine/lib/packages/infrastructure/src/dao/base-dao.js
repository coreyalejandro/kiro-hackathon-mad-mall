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
//# sourceMappingURL=base-dao.js.map