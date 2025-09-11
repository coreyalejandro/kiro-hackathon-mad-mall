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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnktYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInF1ZXJ5LWJ1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7O0FBY0gsTUFBYSxvQkFBb0I7SUFBakM7UUFDVSxrQkFBYSxHQUFxQixFQUFFLENBQUM7UUFDckMscUJBQWdCLEdBQXFCLEVBQUUsQ0FBQztRQUN4QyxtQkFBYyxHQUFvQixFQUFFLENBQUM7UUFDckMseUJBQW9CLEdBQWEsRUFBRSxDQUFDO0lBNlI5QyxDQUFDO0lBdFJDOztPQUVHO0lBQ0gsWUFBWSxDQUFDLFNBQWlCLEVBQUUsUUFBb0MsRUFBRSxLQUFXLEVBQUUsTUFBYztRQUMvRixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDaEUsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxlQUFlLENBQUMsU0FBaUIsRUFBRSxRQUFvQyxFQUFFLEtBQVcsRUFBRSxNQUFjO1FBQ2xHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOztPQUVHO0lBQ0gsWUFBWSxDQUFDLFNBQWlCLEVBQUUsS0FBVTtRQUN4QyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxPQUFPLENBQUMsU0FBaUIsRUFBRSxRQUFvQyxFQUFFLEtBQVcsRUFBRSxNQUFjO1FBQzFGLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FB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IGludGVyZmFjZSBmb3IgYnVpbGRpbmcgRHluYW1vREIgcXVlcmllc1xuICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgUXVlcnlDb25kaXRpb24ge1xuICBhdHRyaWJ1dGU6IHN0cmluZztcbiAgb3BlcmF0b3I6ICdFUScgfCAnTkUnIHwgJ0xUJyB8ICdMRScgfCAnR1QnIHwgJ0dFJyB8ICdCRVRXRUVOJyB8ICdJTicgfCAnQkVHSU5TX1dJVEgnIHwgJ0NPTlRBSU5TJyB8ICdFWElTVFMnIHwgJ05PVF9FWElTVFMnO1xuICB2YWx1ZT86IGFueTtcbiAgdmFsdWVzPzogYW55W107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU29ydENvbmRpdGlvbiB7XG4gIGF0dHJpYnV0ZTogc3RyaW5nO1xuICBkaXJlY3Rpb246ICdBU0MnIHwgJ0RFU0MnO1xufVxuXG5leHBvcnQgY2xhc3MgRHluYW1vREJRdWVyeUJ1aWxkZXIge1xuICBwcml2YXRlIGtleUNvbmRpdGlvbnM6IFF1ZXJ5Q29uZGl0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBmaWx0ZXJDb25kaXRpb25zOiBRdWVyeUNvbmRpdGlvbltdID0gW107XG4gIHByaXZhdGUgc29ydENvbmRpdGlvbnM6IFNvcnRDb25kaXRpb25bXSA9IFtdO1xuICBwcml2YXRlIHByb2plY3Rpb25BdHRyaWJ1dGVzOiBzdHJpbmdbXSA9IFtdO1xuICBwcml2YXRlIGluZGV4TmFtZT86IHN0cmluZztcbiAgcHJpdmF0ZSBsaW1pdFZhbHVlPzogbnVtYmVyO1xuICBwcml2YXRlIGV4Y2x1c2l2ZVN0YXJ0S2V5VmFsdWU/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICBwcml2YXRlIGNvbnNpc3RlbnRSZWFkVmFsdWU/OiBib29sZWFuO1xuICBwcml2YXRlIHNjYW5JbmRleEZvcndhcmRWYWx1ZT86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEFkZCBrZXkgY29uZGl0aW9uIChmb3IgcGFydGl0aW9uIGtleSBhbmQgc29ydCBrZXkpXG4gICAqL1xuICBrZXlDb25kaXRpb24oYXR0cmlidXRlOiBzdHJpbmcsIG9wZXJhdG9yOiBRdWVyeUNvbmRpdGlvblsnb3BlcmF0b3InXSwgdmFsdWU/OiBhbnksIHZhbHVlcz86IGFueVtdKTogdGhpcyB7XG4gICAgdGhpcy5rZXlDb25kaXRpb25zLnB1c2goeyBhdHRyaWJ1dGUsIG9wZXJhdG9yLCB2YWx1ZSwgdmFsdWVzIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBmaWx0ZXIgY29uZGl0aW9uIChhcHBsaWVkIGFmdGVyIHF1ZXJ5KVxuICAgKi9cbiAgZmlsdGVyQ29uZGl0aW9uKGF0dHJpYnV0ZTogc3RyaW5nLCBvcGVyYXRvcjogUXVlcnlDb25kaXRpb25bJ29wZXJhdG9yJ10sIHZhbHVlPzogYW55LCB2YWx1ZXM/OiBhbnlbXSk6IHRoaXMge1xuICAgIHRoaXMuZmlsdGVyQ29uZGl0aW9ucy5wdXNoKHsgYXR0cmlidXRlLCBvcGVyYXRvciwgdmFsdWUsIHZhbHVlcyB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcGFydGl0aW9uIGtleSBjb25kaXRpb25cbiAgICovXG4gIHBhcnRpdGlvbktleShhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IGFueSk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLmtleUNvbmRpdGlvbihhdHRyaWJ1dGUsICdFUScsIHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgc29ydCBrZXkgY29uZGl0aW9uXG4gICAqL1xuICBzb3J0S2V5KGF0dHJpYnV0ZTogc3RyaW5nLCBvcGVyYXRvcjogUXVlcnlDb25kaXRpb25bJ29wZXJhdG9yJ10sIHZhbHVlPzogYW55LCB2YWx1ZXM/OiBhbnlbXSk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLmtleUNvbmRpdGlvbihhdHRyaWJ1dGUsIG9wZXJhdG9yLCB2YWx1ZSwgdmFsdWVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYmVnaW5zIHdpdGggY29uZGl0aW9uIGZvciBzb3J0IGtleVxuICAgKi9cbiAgYmVnaW5zV2l0aChhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLmtleUNvbmRpdGlvbihhdHRyaWJ1dGUsICdCRUdJTlNfV0lUSCcsIHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYmV0d2VlbiBjb25kaXRpb25cbiAgICovXG4gIGJldHdlZW4oYXR0cmlidXRlOiBzdHJpbmcsIGxvdzogYW55LCBoaWdoOiBhbnkpOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5rZXlDb25kaXRpb24oYXR0cmlidXRlLCAnQkVUV0VFTicsIHVuZGVmaW5lZCwgW2xvdywgaGlnaF0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBmaWx0ZXIgZm9yIGF0dHJpYnV0ZSBleGlzdGVuY2VcbiAgICovXG4gIGV4aXN0cyhhdHRyaWJ1dGU6IHN0cmluZyk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLmZpbHRlckNvbmRpdGlvbihhdHRyaWJ1dGUsICdFWElTVFMnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgZmlsdGVyIGZvciBhdHRyaWJ1dGUgbm9uLWV4aXN0ZW5jZVxuICAgKi9cbiAgbm90RXhpc3RzKGF0dHJpYnV0ZTogc3RyaW5nKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyQ29uZGl0aW9uKGF0dHJpYnV0ZSwgJ05PVF9FWElTVFMnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgY29udGFpbnMgZmlsdGVyXG4gICAqL1xuICBjb250YWlucyhhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IGFueSk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLmZpbHRlckNvbmRpdGlvbihhdHRyaWJ1dGUsICdDT05UQUlOUycsIHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgSU4gZmlsdGVyXG4gICAqL1xuICBpbihhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWVzOiBhbnlbXSk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLmZpbHRlckNvbmRpdGlvbihhdHRyaWJ1dGUsICdJTicsIHVuZGVmaW5lZCwgdmFsdWVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcHJvamVjdGlvbiAoc2VsZWN0IHNwZWNpZmljIGF0dHJpYnV0ZXMpXG4gICAqL1xuICBwcm9qZWN0KC4uLmF0dHJpYnV0ZXM6IHN0cmluZ1tdKTogdGhpcyB7XG4gICAgdGhpcy5wcm9qZWN0aW9uQXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVXNlIEdsb2JhbCBTZWNvbmRhcnkgSW5kZXhcbiAgICovXG4gIHVzZUluZGV4KGluZGV4TmFtZTogc3RyaW5nKTogdGhpcyB7XG4gICAgdGhpcy5pbmRleE5hbWUgPSBpbmRleE5hbWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHF1ZXJ5IGxpbWl0XG4gICAqL1xuICBsaW1pdChjb3VudDogbnVtYmVyKTogdGhpcyB7XG4gICAgdGhpcy5saW1pdFZhbHVlID0gY291bnQ7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBhZ2luYXRpb24gc3RhcnQga2V5XG4gICAqL1xuICBleGNsdXNpdmVTdGFydEtleShrZXk6IFJlY29yZDxzdHJpbmcsIGFueT4pOiB0aGlzIHtcbiAgICB0aGlzLmV4Y2x1c2l2ZVN0YXJ0S2V5VmFsdWUgPSBrZXk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRW5hYmxlIGNvbnNpc3RlbnQgcmVhZFxuICAgKi9cbiAgY29uc2lzdGVudFJlYWQoZW5hYmxlZDogYm9vbGVhbiA9IHRydWUpOiB0aGlzIHtcbiAgICB0aGlzLmNvbnNpc3RlbnRSZWFkVmFsdWUgPSBlbmFibGVkO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBzY2FuIGRpcmVjdGlvblxuICAgKi9cbiAgc2NhbkluZGV4Rm9yd2FyZChmb3J3YXJkOiBib29sZWFuID0gdHJ1ZSk6IHRoaXMge1xuICAgIHRoaXMuc2NhbkluZGV4Rm9yd2FyZFZhbHVlID0gZm9yd2FyZDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTb3J0IGluIGFzY2VuZGluZyBvcmRlclxuICAgKi9cbiAgc29ydEFzYyhhdHRyaWJ1dGU/OiBzdHJpbmcpOiB0aGlzIHtcbiAgICBpZiAoYXR0cmlidXRlKSB7XG4gICAgICB0aGlzLnNvcnRDb25kaXRpb25zLnB1c2goeyBhdHRyaWJ1dGUsIGRpcmVjdGlvbjogJ0FTQycgfSk7XG4gICAgfVxuICAgIHRoaXMuc2NhbkluZGV4Rm9yd2FyZFZhbHVlID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTb3J0IGluIGRlc2NlbmRpbmcgb3JkZXJcbiAgICovXG4gIHNvcnREZXNjKGF0dHJpYnV0ZT86IHN0cmluZyk6IHRoaXMge1xuICAgIGlmIChhdHRyaWJ1dGUpIHtcbiAgICAgIHRoaXMuc29ydENvbmRpdGlvbnMucHVzaCh7IGF0dHJpYnV0ZSwgZGlyZWN0aW9uOiAnREVTQycgfSk7XG4gICAgfVxuICAgIHRoaXMuc2NhbkluZGV4Rm9yd2FyZFZhbHVlID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgdGhlIHF1ZXJ5IHBhcmFtZXRlcnNcbiAgICovXG4gIGJ1aWxkKCk6IHtcbiAgICBrZXlDb25kaXRpb25FeHByZXNzaW9uPzogc3RyaW5nO1xuICAgIGZpbHRlckV4cHJlc3Npb24/OiBzdHJpbmc7XG4gICAgcHJvamVjdGlvbkV4cHJlc3Npb24/OiBzdHJpbmc7XG4gICAgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzPzogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgICBpbmRleE5hbWU/OiBzdHJpbmc7XG4gICAgbGltaXQ/OiBudW1iZXI7XG4gICAgZXhjbHVzaXZlU3RhcnRLZXk/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICAgIGNvbnNpc3RlbnRSZWFkPzogYm9vbGVhbjtcbiAgICBzY2FuSW5kZXhGb3J3YXJkPzogYm9vbGVhbjtcbiAgfSB7XG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7fTtcbiAgICBjb25zdCBhdHRyaWJ1dGVOYW1lczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICAgIGNvbnN0IGF0dHJpYnV0ZVZhbHVlczogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuICAgIGxldCBuYW1lQ291bnRlciA9IDA7XG4gICAgbGV0IHZhbHVlQ291bnRlciA9IDA7XG5cbiAgICAvLyBIZWxwZXIgdG8gZ2V0IHVuaXF1ZSBhdHRyaWJ1dGUgbmFtZSBwbGFjZWhvbGRlclxuICAgIGNvbnN0IGdldEF0dHJpYnV0ZU5hbWUgPSAoYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgICAgY29uc3QgcGxhY2Vob2xkZXIgPSBgI2F0dHIke25hbWVDb3VudGVyKyt9YDtcbiAgICAgIGF0dHJpYnV0ZU5hbWVzW3BsYWNlaG9sZGVyXSA9IGF0dHJpYnV0ZTtcbiAgICAgIHJldHVybiBwbGFjZWhvbGRlcjtcbiAgICB9O1xuXG4gICAgLy8gSGVscGVyIHRvIGdldCB1bmlxdWUgYXR0cmlidXRlIHZhbHVlIHBsYWNlaG9sZGVyXG4gICAgY29uc3QgZ2V0QXR0cmlidXRlVmFsdWUgPSAodmFsdWU6IGFueSk6IHN0cmluZyA9PiB7XG4gICAgICBjb25zdCBwbGFjZWhvbGRlciA9IGA6dmFsJHt2YWx1ZUNvdW50ZXIrK31gO1xuICAgICAgYXR0cmlidXRlVmFsdWVzW3BsYWNlaG9sZGVyXSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHBsYWNlaG9sZGVyO1xuICAgIH07XG5cbiAgICAvLyBCdWlsZCBrZXkgY29uZGl0aW9uIGV4cHJlc3Npb25cbiAgICBpZiAodGhpcy5rZXlDb25kaXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGtleUV4cHJlc3Npb25zID0gdGhpcy5rZXlDb25kaXRpb25zLm1hcChjb25kaXRpb24gPT4ge1xuICAgICAgICBjb25zdCBhdHRyTmFtZSA9IGdldEF0dHJpYnV0ZU5hbWUoY29uZGl0aW9uLmF0dHJpYnV0ZSk7XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggKGNvbmRpdGlvbi5vcGVyYXRvcikge1xuICAgICAgICAgIGNhc2UgJ0VRJzpcbiAgICAgICAgICAgIHJldHVybiBgJHthdHRyTmFtZX0gPSAke2dldEF0dHJpYnV0ZVZhbHVlKGNvbmRpdGlvbi52YWx1ZSl9YDtcbiAgICAgICAgICBjYXNlICdORSc6XG4gICAgICAgICAgICByZXR1cm4gYCR7YXR0ck5hbWV9IDw+ICR7Z2V0QXR0cmlidXRlVmFsdWUoY29uZGl0aW9uLnZhbHVlKX1gO1xuICAgICAgICAgIGNhc2UgJ0xUJzpcbiAgICAgICAgICAgIHJldHVybiBgJHthdHRyTmFtZX0gPCAke2dldEF0dHJpYnV0ZVZhbHVlKGNvbmRpdGlvbi52YWx1ZSl9YDtcbiAgICAgICAgICBjYXNlICdMRSc6XG4gICAgICAgICAgICByZXR1cm4gYCR7YXR0ck5hbWV9IDw9ICR7Z2V0QXR0cmlidXRlVmFsdWUoY29uZGl0aW9uLnZhbHVlKX1gO1xuICAgICAgICAgIGNhc2UgJ0dUJzpcbiAgICAgICAgICAgIHJldHVybiBgJHthdHRyTmFtZX0gPiAke2dldEF0dHJpYnV0ZVZhbHVlKGNvbmRpdGlvbi52YWx1ZSl9YDtcbiAgICAgICAgICBjYXNlICdHRSc6XG4gICAgICAgICAgICByZXR1cm4gYCR7YXR0ck5hbWV9ID49ICR7Z2V0QXR0cmlidXRlVmFsdWUoY29uZGl0aW9uLnZhbHVlKX1gO1xuICAgICAgICAgIGNhc2UgJ0JFR0lOU19XSVRIJzpcbiAgICAgICAgICAgIHJldHVybiBgYmVnaW5zX3dpdGgoJHthdHRyTmFtZX0sICR7Z2V0QXR0cmlidXRlVmFsdWUoY29uZGl0aW9uLnZhbHVlKX0pYDtcbiAgICAgICAgICBjYXNlICdCRVRXRUVOJzpcbiAgICAgICAgICAgIHJldHVybiBgJHthdHRyTmFtZX0gQkVUV0VFTiAke2dldEF0dHJpYnV0ZVZhbHVlKGNvbmRpdGlvbi52YWx1ZXMhWzBdKX0gQU5EICR7Z2V0QXR0cmlidXRlVmFsdWUoY29uZGl0aW9uLnZhbHVlcyFbMV0pfWA7XG4gICAgICAgICAgY2FzZSAnSU4nOlxuICAgICAgICAgICAgY29uc3QgaW5WYWx1ZXMgPSBjb25kaXRpb24udmFsdWVzIS5tYXAodiA9PiBnZXRBdHRyaWJ1dGVWYWx1ZSh2KSkuam9pbignLCAnKTtcbiAgICAgICAgICAgIHJldHVybiBgJHthdHRyTmFtZX0gSU4gKCR7aW5WYWx1ZXN9KWA7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQga2V5IGNvbmRpdGlvbiBvcGVyYXRvcjogJHtjb25kaXRpb24ub3BlcmF0b3J9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcGFyYW1zLmtleUNvbmRpdGlvbkV4cHJlc3Npb24gPSBrZXlFeHByZXNzaW9ucy5qb2luKCcgQU5EICcpO1xuICAgIH1cblxuICAgIC8vIEJ1aWxkIGZpbHRlciBleHByZXNzaW9uXG4gICAgaWYgKHRoaXMuZmlsdGVyQ29uZGl0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBmaWx0ZXJFeHByZXNzaW9ucyA9IHRoaXMuZmlsdGVyQ29uZGl0aW9ucy5tYXAoY29uZGl0aW9uID0+IHtcbiAgICAgICAgY29uc3QgYXR0ck5hbWUgPSBnZXRBdHRyaWJ1dGVOYW1lKGNvbmRpdGlvbi5hdHRyaWJ1dGUpO1xuICAgICAgICBcbiAgICAgICAgc3dpdGNoIChjb25kaXRpb24ub3BlcmF0b3IpIHtcbiAgICAgICAgICBjYXNlICdFUSc6XG4gICAgICAgICAgICByZXR1cm4gYCR7YXR0ck5hbWV9ID0gJHtnZXRBdHRyaWJ1dGVWYWx1ZShjb25kaXRpb24udmFsdWUpfWA7XG4gICAgICAgICAgY2FzZSAnTkUnOlxuICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJOYW1lfSA8PiAke2dldEF0dHJpYnV0ZVZhbHVlKGNvbmRpdGlvbi52YWx1ZSl9YDtcbiAgICAgICAgICBjYXNlICdMVCc6XG4gICAgICAgICAgICByZXR1cm4gYCR7YXR0ck5hbWV9IDwgJHtnZXRBdHRyaWJ1dGVWYWx1ZShjb25kaXRpb24udmFsdWUpfWA7XG4gICAgICAgICAgY2FzZSAnTEUnOlxuICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJOYW1lfSA8PSAke2dldEF0dHJpYnV0ZVZhbHVlKGNvbmRpdGlvbi52YWx1ZSl9YDtcbiAgICAgICAgICBjYXNlICdHVCc6XG4gICAgICAgICAgICByZXR1cm4gYCR7YXR0ck5hbWV9ID4gJHtnZXRBdHRyaWJ1dGVWYWx1ZShjb25kaXRpb24udmFsdWUpfWA7XG4gICAgICAgICAgY2FzZSAnR0UnOlxuICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJOYW1lfSA+PSAke2dldEF0dHJpYnV0ZVZhbHVlKGNvbmRpdGlvbi52YWx1ZSl9YDtcbiAgICAgICAgICBjYXNlICdCRUdJTlNfV0lUSCc6XG4gICAgICAgICAgICByZXR1cm4gYGJlZ2luc193aXRoKCR7YXR0ck5hbWV9LCAke2dldEF0dHJpYnV0ZVZhbHVlKGNvbmRpdGlvbi52YWx1ZSl9KWA7XG4gICAgICAgICAgY2FzZSAnQ09OVEFJTlMnOlxuICAgICAgICAgICAgcmV0dXJuIGBjb250YWlucygke2F0dHJOYW1lfSwgJHtnZXRBdHRyaWJ1dGVWYWx1ZShjb25kaXRpb24udmFsdWUpfSlgO1xuICAgICAgICAgIGNhc2UgJ0VYSVNUUyc6XG4gICAgICAgICAgICByZXR1cm4gYGF0dHJpYnV0ZV9leGlzdHMoJHthdHRyTmFtZX0pYDtcbiAgICAgICAgICBjYXNlICdOT1RfRVhJU1RTJzpcbiAgICAgICAgICAgIHJldHVybiBgYXR0cmlidXRlX25vdF9leGlzdHMoJHthdHRyTmFtZX0pYDtcbiAgICAgICAgICBjYXNlICdCRVRXRUVOJzpcbiAgICAgICAgICAgIHJldHVybiBgJHthdHRyTmFtZX0gQkVUV0VFTiAke2dldEF0dHJpYnV0ZVZhbHVlKGNvbmRpdGlvbi52YWx1ZXMhWzBdKX0gQU5EICR7Z2V0QXR0cmlidXRlVmFsdWUoY29uZGl0aW9uLnZhbHVlcyFbMV0pfWA7XG4gICAgICAgICAgY2FzZSAnSU4nOlxuICAgICAgICAgICAgY29uc3QgaW5WYWx1ZXMgPSBjb25kaXRpb24udmFsdWVzIS5tYXAodiA9PiBnZXRBdHRyaWJ1dGVWYWx1ZSh2KSkuam9pbignLCAnKTtcbiAgICAgICAgICAgIHJldHVybiBgJHthdHRyTmFtZX0gSU4gKCR7aW5WYWx1ZXN9KWA7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZmlsdGVyIGNvbmRpdGlvbiBvcGVyYXRvcjogJHtjb25kaXRpb24ub3BlcmF0b3J9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcGFyYW1zLmZpbHRlckV4cHJlc3Npb24gPSBmaWx0ZXJFeHByZXNzaW9ucy5qb2luKCcgQU5EICcpO1xuICAgIH1cblxuICAgIC8vIEJ1aWxkIHByb2plY3Rpb24gZXhwcmVzc2lvblxuICAgIGlmICh0aGlzLnByb2plY3Rpb25BdHRyaWJ1dGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHBhcmFtcy5wcm9qZWN0aW9uRXhwcmVzc2lvbiA9IHRoaXMucHJvamVjdGlvbkF0dHJpYnV0ZXNcbiAgICAgICAgLm1hcChhdHRyID0+IGdldEF0dHJpYnV0ZU5hbWUoYXR0cikpXG4gICAgICAgIC5qb2luKCcsICcpO1xuICAgIH1cblxuICAgIC8vIEFkZCBleHByZXNzaW9uIGF0dHJpYnV0ZSBuYW1lcyBhbmQgdmFsdWVzIGlmIHRoZXkgZXhpc3RcbiAgICBpZiAoT2JqZWN0LmtleXMoYXR0cmlidXRlTmFtZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgIHBhcmFtcy5leHByZXNzaW9uQXR0cmlidXRlTmFtZXMgPSBhdHRyaWJ1dGVOYW1lcztcbiAgICB9XG4gICAgaWYgKE9iamVjdC5rZXlzKGF0dHJpYnV0ZVZhbHVlcykubGVuZ3RoID4gMCkge1xuICAgICAgcGFyYW1zLmV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXMgPSBhdHRyaWJ1dGVWYWx1ZXM7XG4gICAgfVxuXG4gICAgLy8gQWRkIG90aGVyIHBhcmFtZXRlcnNcbiAgICBpZiAodGhpcy5pbmRleE5hbWUpIHBhcmFtcy5pbmRleE5hbWUgPSB0aGlzLmluZGV4TmFtZTtcbiAgICBpZiAodGhpcy5saW1pdFZhbHVlKSBwYXJhbXMubGltaXQgPSB0aGlzLmxpbWl0VmFsdWU7XG4gICAgaWYgKHRoaXMuZXhjbHVzaXZlU3RhcnRLZXlWYWx1ZSkgcGFyYW1zLmV4Y2x1c2l2ZVN0YXJ0S2V5ID0gdGhpcy5leGNsdXNpdmVTdGFydEtleVZhbHVlO1xuICAgIGlmICh0aGlzLmNvbnNpc3RlbnRSZWFkVmFsdWUgIT09IHVuZGVmaW5lZCkgcGFyYW1zLmNvbnNpc3RlbnRSZWFkID0gdGhpcy5jb25zaXN0ZW50UmVhZFZhbHVlO1xuICAgIGlmICh0aGlzLnNjYW5JbmRleEZvcndhcmRWYWx1ZSAhPT0gdW5kZWZpbmVkKSBwYXJhbXMuc2NhbkluZGV4Rm9yd2FyZCA9IHRoaXMuc2NhbkluZGV4Rm9yd2FyZFZhbHVlO1xuXG4gICAgcmV0dXJuIHBhcmFtcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgcXVlcnkgYnVpbGRlciBpbnN0YW5jZVxuICAgKi9cbiAgc3RhdGljIGNyZWF0ZSgpOiBEeW5hbW9EQlF1ZXJ5QnVpbGRlciB7XG4gICAgcmV0dXJuIG5ldyBEeW5hbW9EQlF1ZXJ5QnVpbGRlcigpO1xuICB9XG59XG5cbi8vIENvbnZlbmllbmNlIGZ1bmN0aW9ucyBmb3IgY29tbW9uIHF1ZXJ5IHBhdHRlcm5zXG5leHBvcnQgY29uc3QgUXVlcnlCdWlsZGVyID0ge1xuICAvKipcbiAgICogUXVlcnkgYnkgcGFydGl0aW9uIGtleVxuICAgKi9cbiAgYnlQYXJ0aXRpb25LZXkocGs6IHN0cmluZywgdmFsdWU6IGFueSk6IER5bmFtb0RCUXVlcnlCdWlsZGVyIHtcbiAgICByZXR1cm4gRHluYW1vREJRdWVyeUJ1aWxkZXIuY3JlYXRlKCkucGFydGl0aW9uS2V5KHBrLCB2YWx1ZSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFF1ZXJ5IGJ5IHBhcnRpdGlvbiBrZXkgYW5kIHNvcnQga2V5XG4gICAqL1xuICBieUtleXMocGs6IHN0cmluZywgcGtWYWx1ZTogYW55LCBzazogc3RyaW5nLCBza1ZhbHVlOiBhbnkpOiBEeW5hbW9EQlF1ZXJ5QnVpbGRlciB7XG4gICAgcmV0dXJuIER5bmFtb0RCUXVlcnlCdWlsZGVyLmNyZWF0ZSgpXG4gICAgICAucGFydGl0aW9uS2V5KHBrLCBwa1ZhbHVlKVxuICAgICAgLnNvcnRLZXkoc2ssICdFUScsIHNrVmFsdWUpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBRdWVyeSB3aXRoIGJlZ2luc193aXRoIG9uIHNvcnQga2V5XG4gICAqL1xuICBiZWdpbnNXaXRoKHBrOiBzdHJpbmcsIHBrVmFsdWU6IGFueSwgc2s6IHN0cmluZywgc2tQcmVmaXg6IHN0cmluZyk6IER5bmFtb0RCUXVlcnlCdWlsZGVyIHtcbiAgICByZXR1cm4gRHluYW1vREJRdWVyeUJ1aWxkZXIuY3JlYXRlKClcbiAgICAgIC5wYXJ0aXRpb25LZXkocGssIHBrVmFsdWUpXG4gICAgICAuYmVnaW5zV2l0aChzaywgc2tQcmVmaXgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBRdWVyeSBHU0kgYnkgcGFydGl0aW9uIGtleVxuICAgKi9cbiAgZ3NpQnlQYXJ0aXRpb25LZXkoaW5kZXhOYW1lOiBzdHJpbmcsIHBrOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBEeW5hbW9EQlF1ZXJ5QnVpbGRlciB7XG4gICAgcmV0dXJuIER5bmFtb0RCUXVlcnlCdWlsZGVyLmNyZWF0ZSgpXG4gICAgICAudXNlSW5kZXgoaW5kZXhOYW1lKVxuICAgICAgLnBhcnRpdGlvbktleShwaywgdmFsdWUpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBRdWVyeSBHU0kgYnkgcGFydGl0aW9uIGtleSBhbmQgc29ydCBrZXlcbiAgICovXG4gIGdzaUJ5S2V5cyhpbmRleE5hbWU6IHN0cmluZywgcGs6IHN0cmluZywgcGtWYWx1ZTogYW55LCBzazogc3RyaW5nLCBza1ZhbHVlOiBhbnkpOiBEeW5hbW9EQlF1ZXJ5QnVpbGRlciB7XG4gICAgcmV0dXJuIER5bmFtb0RCUXVlcnlCdWlsZGVyLmNyZWF0ZSgpXG4gICAgICAudXNlSW5kZXgoaW5kZXhOYW1lKVxuICAgICAgLnBhcnRpdGlvbktleShwaywgcGtWYWx1ZSlcbiAgICAgIC5zb3J0S2V5KHNrLCAnRVEnLCBza1ZhbHVlKTtcbiAgfSxcbn07Il19