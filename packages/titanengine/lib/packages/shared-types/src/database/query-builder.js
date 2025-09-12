"use strict";
/**
 * DynamoDB Query Builder
 * Fluent interface for building DynamoDB queries
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = exports.DynamoDBQueryBuilder = void 0;
class DynamoDBQueryBuilder {
    constructor() {
        this.keyConditions = [];
        this.filterConditions = [];
        this.sortConditions = [];
        this.projectionAttributes = [];
    }
    /**
     * Add key condition (for partition key and sort key)
     */
    keyCondition(attribute, operator, value, values) {
        this.keyConditions.push({ attribute, operator, value, values });
        return this;
    }
    /**
     * Add filter condition (applied after query)
     */
    filterCondition(attribute, operator, value, values) {
        this.filterConditions.push({ attribute, operator, value, values });
        return this;
    }
    /**
     * Set partition key condition
     */
    partitionKey(attribute, value) {
        return this.keyCondition(attribute, 'EQ', value);
    }
    /**
     * Set sort key condition
     */
    sortKey(attribute, operator, value, values) {
        return this.keyCondition(attribute, operator, value, values);
    }
    /**
     * Add begins with condition for sort key
     */
    beginsWith(attribute, value) {
        return this.keyCondition(attribute, 'BEGINS_WITH', value);
    }
    /**
     * Add between condition
     */
    between(attribute, low, high) {
        return this.keyCondition(attribute, 'BETWEEN', undefined, [low, high]);
    }
    /**
     * Add filter for attribute existence
     */
    exists(attribute) {
        return this.filterCondition(attribute, 'EXISTS');
    }
    /**
     * Add filter for attribute non-existence
     */
    notExists(attribute) {
        return this.filterCondition(attribute, 'NOT_EXISTS');
    }
    /**
     * Add contains filter
     */
    contains(attribute, value) {
        return this.filterCondition(attribute, 'CONTAINS', value);
    }
    /**
     * Add IN filter
     */
    in(attribute, values) {
        return this.filterCondition(attribute, 'IN', undefined, values);
    }
    /**
     * Set projection (select specific attributes)
     */
    project(...attributes) {
        this.projectionAttributes = attributes;
        return this;
    }
    /**
     * Use Global Secondary Index
     */
    useIndex(indexName) {
        this.indexName = indexName;
        return this;
    }
    /**
     * Set query limit
     */
    limit(count) {
        this.limitValue = count;
        return this;
    }
    /**
     * Set pagination start key
     */
    exclusiveStartKey(key) {
        this.exclusiveStartKeyValue = key;
        return this;
    }
    /**
     * Enable consistent read
     */
    consistentRead(enabled = true) {
        this.consistentReadValue = enabled;
        return this;
    }
    /**
     * Set scan direction
     */
    scanIndexForward(forward = true) {
        this.scanIndexForwardValue = forward;
        return this;
    }
    /**
     * Sort in ascending order
     */
    sortAsc(attribute) {
        if (attribute) {
            this.sortConditions.push({ attribute, direction: 'ASC' });
        }
        this.scanIndexForwardValue = true;
        return this;
    }
    /**
     * Sort in descending order
     */
    sortDesc(attribute) {
        if (attribute) {
            this.sortConditions.push({ attribute, direction: 'DESC' });
        }
        this.scanIndexForwardValue = false;
        return this;
    }
    /**
     * Build the query parameters
     */
    build() {
        const params = {};
        const attributeNames = {};
        const attributeValues = {};
        let nameCounter = 0;
        let valueCounter = 0;
        // Helper to get unique attribute name placeholder
        const getAttributeName = (attribute) => {
            const placeholder = `#attr${nameCounter++}`;
            attributeNames[placeholder] = attribute;
            return placeholder;
        };
        // Helper to get unique attribute value placeholder
        const getAttributeValue = (value) => {
            const placeholder = `:val${valueCounter++}`;
            attributeValues[placeholder] = value;
            return placeholder;
        };
        // Build key condition expression
        if (this.keyConditions.length > 0) {
            const keyExpressions = this.keyConditions.map(condition => {
                const attrName = getAttributeName(condition.attribute);
                switch (condition.operator) {
                    case 'EQ':
                        return `${attrName} = ${getAttributeValue(condition.value)}`;
                    case 'NE':
                        return `${attrName} <> ${getAttributeValue(condition.value)}`;
                    case 'LT':
                        return `${attrName} < ${getAttributeValue(condition.value)}`;
                    case 'LE':
                        return `${attrName} <= ${getAttributeValue(condition.value)}`;
                    case 'GT':
                        return `${attrName} > ${getAttributeValue(condition.value)}`;
                    case 'GE':
                        return `${attrName} >= ${getAttributeValue(condition.value)}`;
                    case 'BEGINS_WITH':
                        return `begins_with(${attrName}, ${getAttributeValue(condition.value)})`;
                    case 'BETWEEN':
                        return `${attrName} BETWEEN ${getAttributeValue(condition.values[0])} AND ${getAttributeValue(condition.values[1])}`;
                    case 'IN':
                        const inValues = condition.values.map(v => getAttributeValue(v)).join(', ');
                        return `${attrName} IN (${inValues})`;
                    default:
                        throw new Error(`Unsupported key condition operator: ${condition.operator}`);
                }
            });
            params.keyConditionExpression = keyExpressions.join(' AND ');
        }
        // Build filter expression
        if (this.filterConditions.length > 0) {
            const filterExpressions = this.filterConditions.map(condition => {
                const attrName = getAttributeName(condition.attribute);
                switch (condition.operator) {
                    case 'EQ':
                        return `${attrName} = ${getAttributeValue(condition.value)}`;
                    case 'NE':
                        return `${attrName} <> ${getAttributeValue(condition.value)}`;
                    case 'LT':
                        return `${attrName} < ${getAttributeValue(condition.value)}`;
                    case 'LE':
                        return `${attrName} <= ${getAttributeValue(condition.value)}`;
                    case 'GT':
                        return `${attrName} > ${getAttributeValue(condition.value)}`;
                    case 'GE':
                        return `${attrName} >= ${getAttributeValue(condition.value)}`;
                    case 'BEGINS_WITH':
                        return `begins_with(${attrName}, ${getAttributeValue(condition.value)})`;
                    case 'CONTAINS':
                        return `contains(${attrName}, ${getAttributeValue(condition.value)})`;
                    case 'EXISTS':
                        return `attribute_exists(${attrName})`;
                    case 'NOT_EXISTS':
                        return `attribute_not_exists(${attrName})`;
                    case 'BETWEEN':
                        return `${attrName} BETWEEN ${getAttributeValue(condition.values[0])} AND ${getAttributeValue(condition.values[1])}`;
                    case 'IN':
                        const inValues = condition.values.map(v => getAttributeValue(v)).join(', ');
                        return `${attrName} IN (${inValues})`;
                    default:
                        throw new Error(`Unsupported filter condition operator: ${condition.operator}`);
                }
            });
            params.filterExpression = filterExpressions.join(' AND ');
        }
        // Build projection expression
        if (this.projectionAttributes.length > 0) {
            params.projectionExpression = this.projectionAttributes
                .map(attr => getAttributeName(attr))
                .join(', ');
        }
        // Add expression attribute names and values if they exist
        if (Object.keys(attributeNames).length > 0) {
            params.expressionAttributeNames = attributeNames;
        }
        if (Object.keys(attributeValues).length > 0) {
            params.expressionAttributeValues = attributeValues;
        }
        // Add other parameters
        if (this.indexName)
            params.indexName = this.indexName;
        if (this.limitValue)
            params.limit = this.limitValue;
        if (this.exclusiveStartKeyValue)
            params.exclusiveStartKey = this.exclusiveStartKeyValue;
        if (this.consistentReadValue !== undefined)
            params.consistentRead = this.consistentReadValue;
        if (this.scanIndexForwardValue !== undefined)
            params.scanIndexForward = this.scanIndexForwardValue;
        return params;
    }
    /**
     * Create a new query builder instance
     */
    static create() {
        return new DynamoDBQueryBuilder();
    }
}
exports.DynamoDBQueryBuilder = DynamoDBQueryBuilder;
// Convenience functions for common query patterns
exports.QueryBuilder = {
    /**
     * Query by partition key
     */
    byPartitionKey(pk, value) {
        return DynamoDBQueryBuilder.create().partitionKey(pk, value);
    },
    /**
     * Query by partition key and sort key
     */
    byKeys(pk, pkValue, sk, skValue) {
        return DynamoDBQueryBuilder.create()
            .partitionKey(pk, pkValue)
            .sortKey(sk, 'EQ', skValue);
    },
    /**
     * Query with begins_with on sort key
     */
    beginsWith(pk, pkValue, sk, skPrefix) {
        return DynamoDBQueryBuilder.create()
            .partitionKey(pk, pkValue)
            .beginsWith(sk, skPrefix);
    },
    /**
     * Query GSI by partition key
     */
    gsiByPartitionKey(indexName, pk, value) {
        return DynamoDBQueryBuilder.create()
            .useIndex(indexName)
            .partitionKey(pk, value);
    },
    /**
     * Query GSI by partition key and sort key
     */
    gsiByKeys(indexName, pk, pkValue, sk, skValue) {
        return DynamoDBQueryBuilder.create()
            .useIndex(indexName)
            .partitionKey(pk, pkValue)
            .sortKey(sk, 'EQ', skValue);
    },
};
//# sourceMappingURL=query-builder.js.map