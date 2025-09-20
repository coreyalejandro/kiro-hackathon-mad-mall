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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnktYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NoYXJlZC10eXBlcy9zcmMvZGF0YWJhc2UvcXVlcnktYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7QUFjSCxNQUFhLG9CQUFvQjtJQUFqQztRQUNVLGtCQUFhLEdBQXFCLEVBQUUsQ0FBQztRQUNyQyxxQkFBZ0IsR0FBcUIsRUFBRSxDQUFDO1FBQ3hDLG1CQUFjLEdBQW9CLEVBQUUsQ0FBQztRQUNyQyx5QkFBb0IsR0FBYSxFQUFFLENBQUM7SUE2UjlDLENBQUM7SUF0UkM7O09BRUc7SUFDSCxZQUFZLENBQUMsU0FBaUIsRUFBRSxRQUFvQyxFQUFFLEtBQVcsRUFBRSxNQUFjO1FBQy9GLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNoRSxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7T0FFRztJQUNILGVBQWUsQ0FBQyxTQUFpQixFQUFFLFFBQW9DLEVBQUUsS0FBVyxFQUFFLE1BQWM7UUFDbEcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDbkUsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxZQUFZLENBQUMsU0FBaUIsRUFBRSxLQUFVO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU8sQ0FBQyxTQUFpQixFQUFFLFFBQW9DLEVBQUUsS0FBVyxFQUFFLE1BQWM7UUFDMUYsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFD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OlsiLyoqXG4gKiBEeW5hbW9EQiBRdWVyeSBCdWlsZGVyXG4gKiBGbHVlbnQgaW50ZXJmYWNlIGZvciBidWlsZGluZyBEeW5hbW9EQiBxdWVyaWVzXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBRdWVyeUNvbmRpdGlvbiB7XG4gIGF0dHJpYnV0ZTogc3RyaW5nO1xuICBvcGVyYXRvcjogJ0VRJyB8ICdORScgfCAnTFQnIHwgJ0xFJyB8ICdHVCcgfCAnR0UnIHwgJ0JFVFdFRU4nIHwgJ0lOJyB8ICdCRUdJTlNfV0lUSCcgfCAnQ09OVEFJTlMnIHwgJ0VYSVNUUycgfCAnTk9UX0VYSVNUUyc7XG4gIHZhbHVlPzogYW55O1xuICB2YWx1ZXM/OiBhbnlbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTb3J0Q29uZGl0aW9uIHtcbiAgYXR0cmlidXRlOiBzdHJpbmc7XG4gIGRpcmVjdGlvbjogJ0FTQycgfCAnREVTQyc7XG59XG5cbmV4cG9ydCBjbGFzcyBEeW5hbW9EQlF1ZXJ5QnVpbGRlciB7XG4gIHByaXZhdGUga2V5Q29uZGl0aW9uczogUXVlcnlDb25kaXRpb25bXSA9IFtdO1xuICBwcml2YXRlIGZpbHRlckNvbmRpdGlvbnM6IFF1ZXJ5Q29uZGl0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBzb3J0Q29uZGl0aW9uczogU29ydENvbmRpdGlvbltdID0gW107XG4gIHByaXZhdGUgcHJvamVjdGlvbkF0dHJpYnV0ZXM6IHN0cmluZ1tdID0gW107XG4gIHByaXZhdGUgaW5kZXhOYW1lPzogc3RyaW5nO1xuICBwcml2YXRlIGxpbWl0VmFsdWU/OiBudW1iZXI7XG4gIHByaXZhdGUgZXhjbHVzaXZlU3RhcnRLZXlWYWx1ZT86IFJlY29yZDxzdHJpbmcsIGFueT47XG4gIHByaXZhdGUgY29uc2lzdGVudFJlYWRWYWx1ZT86IGJvb2xlYW47XG4gIHByaXZhdGUgc2NhbkluZGV4Rm9yd2FyZFZhbHVlPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogQWRkIGtleSBjb25kaXRpb24gKGZvciBwYXJ0aXRpb24ga2V5IGFuZCBzb3J0IGtleSlcbiAgICovXG4gIGtleUNvbmRpdGlvbihhdHRyaWJ1dGU6IHN0cmluZywgb3BlcmF0b3I6IFF1ZXJ5Q29uZGl0aW9uWydvcGVyYXRvciddLCB2YWx1ZT86IGFueSwgdmFsdWVzPzogYW55W10pOiB0aGlzIHtcbiAgICB0aGlzLmtleUNvbmRpdGlvbnMucHVzaCh7IGF0dHJpYnV0ZSwgb3BlcmF0b3IsIHZhbHVlLCB2YWx1ZXMgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGZpbHRlciBjb25kaXRpb24gKGFwcGxpZWQgYWZ0ZXIgcXVlcnkpXG4gICAqL1xuICBmaWx0ZXJDb25kaXRpb24oYXR0cmlidXRlOiBzdHJpbmcsIG9wZXJhdG9yOiBRdWVyeUNvbmRpdGlvblsnb3BlcmF0b3InXSwgdmFsdWU/OiBhbnksIHZhbHVlcz86IGFueVtdKTogdGhpcyB7XG4gICAgdGhpcy5maWx0ZXJDb25kaXRpb25zLnB1c2goeyBhdHRyaWJ1dGUsIG9wZXJhdG9yLCB2YWx1ZSwgdmFsdWVzIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBwYXJ0aXRpb24ga2V5IGNvbmRpdGlvblxuICAgKi9cbiAgcGFydGl0aW9uS2V5KGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMua2V5Q29uZGl0aW9uKGF0dHJpYnV0ZSwgJ0VRJywgdmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBzb3J0IGtleSBjb25kaXRpb25cbiAgICovXG4gIHNvcnRLZXkoYXR0cmlidXRlOiBzdHJpbmcsIG9wZXJhdG9yOiBRdWVyeUNvbmRpdGlvblsnb3BlcmF0b3InXSwgdmFsdWU/OiBhbnksIHZhbHVlcz86IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMua2V5Q29uZGl0aW9uKGF0dHJpYnV0ZSwgb3BlcmF0b3IsIHZhbHVlLCB2YWx1ZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBiZWdpbnMgd2l0aCBjb25kaXRpb24gZm9yIHNvcnQga2V5XG4gICAqL1xuICBiZWdpbnNXaXRoKGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMua2V5Q29uZGl0aW9uKGF0dHJpYnV0ZSwgJ0JFR0lOU19XSVRIJywgdmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBiZXR3ZWVuIGNvbmRpdGlvblxuICAgKi9cbiAgYmV0d2VlbihhdHRyaWJ1dGU6IHN0cmluZywgbG93OiBhbnksIGhpZ2g6IGFueSk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLmtleUNvbmRpdGlvbihhdHRyaWJ1dGUsICdCRVRXRUVOJywgdW5kZWZpbmVkLCBbbG93LCBoaWdoXSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGZpbHRlciBmb3IgYXR0cmlidXRlIGV4aXN0ZW5jZVxuICAgKi9cbiAgZXhpc3RzKGF0dHJpYnV0ZTogc3RyaW5nKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyQ29uZGl0aW9uKGF0dHJpYnV0ZSwgJ0VYSVNUUycpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBmaWx0ZXIgZm9yIGF0dHJpYnV0ZSBub24tZXhpc3RlbmNlXG4gICAqL1xuICBub3RFeGlzdHMoYXR0cmlidXRlOiBzdHJpbmcpOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJDb25kaXRpb24oYXR0cmlidXRlLCAnTk9UX0VYSVNUUycpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBjb250YWlucyBmaWx0ZXJcbiAgICovXG4gIGNvbnRhaW5zKGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyQ29uZGl0aW9uKGF0dHJpYnV0ZSwgJ0NPTlRBSU5TJywgdmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBJTiBmaWx0ZXJcbiAgICovXG4gIGluKGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZXM6IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyQ29uZGl0aW9uKGF0dHJpYnV0ZSwgJ0lOJywgdW5kZWZpbmVkLCB2YWx1ZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBwcm9qZWN0aW9uIChzZWxlY3Qgc3BlY2lmaWMgYXR0cmlidXRlcylcbiAgICovXG4gIHByb2plY3QoLi4uYXR0cmlidXRlczogc3RyaW5nW10pOiB0aGlzIHtcbiAgICB0aGlzLnByb2plY3Rpb25BdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgR2xvYmFsIFNlY29uZGFyeSBJbmRleFxuICAgKi9cbiAgdXNlSW5kZXgoaW5kZXhOYW1lOiBzdHJpbmcpOiB0aGlzIHtcbiAgICB0aGlzLmluZGV4TmFtZSA9IGluZGV4TmFtZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcXVlcnkgbGltaXRcbiAgICovXG4gIGxpbWl0KGNvdW50OiBudW1iZXIpOiB0aGlzIHtcbiAgICB0aGlzLmxpbWl0VmFsdWUgPSBjb3VudDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcGFnaW5hdGlvbiBzdGFydCBrZXlcbiAgICovXG4gIGV4Y2x1c2l2ZVN0YXJ0S2V5KGtleTogUmVjb3JkPHN0cmluZywgYW55Pik6IHRoaXMge1xuICAgIHRoaXMuZXhjbHVzaXZlU3RhcnRLZXlWYWx1ZSA9IGtleTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmFibGUgY29uc2lzdGVudCByZWFkXG4gICAqL1xuICBjb25zaXN0ZW50UmVhZChlbmFibGVkOiBib29sZWFuID0gdHJ1ZSk6IHRoaXMge1xuICAgIHRoaXMuY29uc2lzdGVudFJlYWRWYWx1ZSA9IGVuYWJsZWQ7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHNjYW4gZGlyZWN0aW9uXG4gICAqL1xuICBzY2FuSW5kZXhGb3J3YXJkKGZvcndhcmQ6IGJvb2xlYW4gPSB0cnVlKTogdGhpcyB7XG4gICAgdGhpcy5zY2FuSW5kZXhGb3J3YXJkVmFsdWUgPSBmb3J3YXJkO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNvcnQgaW4gYXNjZW5kaW5nIG9yZGVyXG4gICAqL1xuICBzb3J0QXNjKGF0dHJpYnV0ZT86IHN0cmluZyk6IHRoaXMge1xuICAgIGlmIChhdHRyaWJ1dGUpIHtcbiAgICAgIHRoaXMuc29ydENvbmRpdGlvbnMucHVzaCh7IGF0dHJpYnV0ZSwgZGlyZWN0aW9uOiAnQVNDJyB9KTtcbiAgICB9XG4gICAgdGhpcy5zY2FuSW5kZXhGb3J3YXJkVmFsdWUgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNvcnQgaW4gZGVzY2VuZGluZyBvcmRlclxuICAgKi9cbiAgc29ydERlc2MoYXR0cmlidXRlPzogc3RyaW5nKTogdGhpcyB7XG4gICAgaWYgKGF0dHJpYnV0ZSkge1xuICAgICAgdGhpcy5zb3J0Q29uZGl0aW9ucy5wdXNoKHsgYXR0cmlidXRlLCBkaXJlY3Rpb246ICdERVNDJyB9KTtcbiAgICB9XG4gICAgdGhpcy5zY2FuSW5kZXhGb3J3YXJkVmFsdWUgPSBmYWxzZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZCB0aGUgcXVlcnkgcGFyYW1ldGVyc1xuICAgKi9cbiAgYnVpbGQoKToge1xuICAgIGtleUNvbmRpdGlvbkV4cHJlc3Npb24/OiBzdHJpbmc7XG4gICAgZmlsdGVyRXhwcmVzc2lvbj86IHN0cmluZztcbiAgICBwcm9qZWN0aW9uRXhwcmVzc2lvbj86IHN0cmluZztcbiAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICAgIGluZGV4TmFtZT86IHN0cmluZztcbiAgICBsaW1pdD86IG51bWJlcjtcbiAgICBleGNsdXNpdmVTdGFydEtleT86IFJlY29yZDxzdHJpbmcsIGFueT47XG4gICAgY29uc2lzdGVudFJlYWQ/OiBib29sZWFuO1xuICAgIHNjYW5JbmRleEZvcndhcmQ/OiBib29sZWFuO1xuICB9IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHt9O1xuICAgIGNvbnN0IGF0dHJpYnV0ZU5hbWVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gICAgY29uc3QgYXR0cmlidXRlVmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG4gICAgbGV0IG5hbWVDb3VudGVyID0gMDtcbiAgICBsZXQgdmFsdWVDb3VudGVyID0gMDtcblxuICAgIC8vIEhlbHBlciB0byBnZXQgdW5pcXVlIGF0dHJpYnV0ZSBuYW1lIHBsYWNlaG9sZGVyXG4gICAgY29uc3QgZ2V0QXR0cmlidXRlTmFtZSA9IChhdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICBjb25zdCBwbGFjZWhvbGRlciA9IGAjYXR0ciR7bmFtZUNvdW50ZXIrK31gO1xuICAgICAgYXR0cmlidXRlTmFtZXNbcGxhY2Vob2xkZXJdID0gYXR0cmlidXRlO1xuICAgICAgcmV0dXJuIHBsYWNlaG9sZGVyO1xuICAgIH07XG5cbiAgICAvLyBIZWxwZXIgdG8gZ2V0IHVuaXF1ZSBhdHRyaWJ1dGUgdmFsdWUgcGxhY2Vob2xkZXJcbiAgICBjb25zdCBnZXRBdHRyaWJ1dGVWYWx1ZSA9ICh2YWx1ZTogYW55KTogc3RyaW5nID0+IHtcbiAgICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gYDp2YWwke3ZhbHVlQ291bnRlcisrfWA7XG4gICAgICBhdHRyaWJ1dGVWYWx1ZXNbcGxhY2Vob2xkZXJdID0gdmFsdWU7XG4gICAgICByZXR1cm4gcGxhY2Vob2xkZXI7XG4gICAgfTtcblxuICAgIC8vIEJ1aWxkIGtleSBjb25kaXRpb24gZXhwcmVzc2lvblxuICAgIGlmICh0aGlzLmtleUNvbmRpdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qga2V5RXhwcmVzc2lvbnMgPSB0aGlzLmtleUNvbmRpdGlvbnMubWFwKGNvbmRpdGlvbiA9PiB7XG4gICAgICAgIGNvbnN0IGF0dHJOYW1lID0gZ2V0QXR0cmlidXRlTmFtZShjb25kaXRpb24uYXR0cmlidXRlKTtcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCAoY29uZGl0aW9uLm9wZXJhdG9yKSB7XG4gICAgICAgICAgY2FzZSAnRVEnOlxuICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJOYW1lfSA9ICR7Z2V0QXR0cmlidXRlVmFsdWUoY29uZGl0aW9uLnZhbHVlKX1gO1xuICAgICAgICAgIGNhc2UgJ05FJzpcbiAgICAgICAgICAgIHJldHVybiBgJHthdHRyTmFtZX0gPD4gJHtnZXRBdHRyaWJ1dGVWYWx1ZShjb25kaXRpb24udmFsdWUpfWA7XG4gICAgICAgICAgY2FzZSAnTFQnOlxuICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJOYW1lfSA8ICR7Z2V0QXR0cmlidXRlVmFsdWUoY29uZGl0aW9uLnZhbHVlKX1gO1xuICAgICAgICAgIGNhc2UgJ0xFJzpcbiAgICAgICAgICAgIHJldHVybiBgJHthdHRyTmFtZX0gPD0gJHtnZXRBdHRyaWJ1dGVWYWx1ZShjb25kaXRpb24udmFsdWUpfWA7XG4gICAgICAgICAgY2FzZSAnR1QnOlxuICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJOYW1lfSA+ICR7Z2V0QXR0cmlidXRlVmFsdWUoY29uZGl0aW9uLnZhbHVlKX1gO1xuICAgICAgICAgIGNhc2UgJ0dFJzpcbiAgICAgICAgICAgIHJldHVybiBgJHthdHRyTmFtZX0gPj0gJHtnZXRBdHRyaWJ1dGVWYWx1ZShjb25kaXRpb24udmFsdWUpfWA7XG4gICAgICAgICAgY2FzZSAnQkVHSU5TX1dJVEgnOlxuICAgICAgICAgICAgcmV0dXJuIGBiZWdpbnNfd2l0aCgke2F0dHJOYW1lfSwgJHtnZXRBdHRyaWJ1dGVWYWx1ZShjb25kaXRpb24udmFsdWUpfSlgO1xuICAgICAgICAgIGNhc2UgJ0JFVFdFRU4nOlxuICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJOYW1lfSBCRVRXRUVOICR7Z2V0QXR0cmlidXRlVmFsdWUoY29uZGl0aW9uLnZhbHVlcyFbMF0pfSBBTkQgJHtnZXRBdHRyaWJ1dGVWYWx1ZShjb25kaXRpb24udmFsdWVzIVsxXSl9YDtcbiAgICAgICAgICBjYXNlICdJTic6XG4gICAgICAgICAgICBjb25zdCBpblZhbHVlcyA9IGNvbmRpdGlvbi52YWx1ZXMhLm1hcCh2ID0+IGdldEF0dHJpYnV0ZVZhbHVlKHYpKS5qb2luKCcsICcpO1xuICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJOYW1lfSBJTiAoJHtpblZhbHVlc30pYDtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBrZXkgY29uZGl0aW9uIG9wZXJhdG9yOiAke2NvbmRpdGlvbi5vcGVyYXRvcn1gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBwYXJhbXMua2V5Q29uZGl0aW9uRXhwcmVzc2lvbiA9IGtleUV4cHJlc3Npb25zLmpvaW4oJyBBTkQgJyk7XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgZmlsdGVyIGV4cHJlc3Npb25cbiAgICBpZiAodGhpcy5maWx0ZXJDb25kaXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGZpbHRlckV4cHJlc3Npb25zID0gdGhpcy5maWx0ZXJDb25kaXRpb25zLm1hcChjb25kaXRpb24gPT4ge1xuICAgICAgICBjb25zdCBhdHRyTmFtZSA9IGdldEF0dHJpYnV0ZU5hbWUoY29uZGl0aW9uLmF0dHJpYnV0ZSk7XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggKGNvbmRpdGlvbi5vcGVyYXRvcikge1xuICAgICAgICAgIGNhc2UgJ0VRJzpcbiAgICAgICAgICAgIHJldHVybiBgJHthdHRyTmFtZX0gPSAke2dldEF0dHJpYnV0ZVZhbHVlKGNvbmRpdGlvbi52YWx1ZSl9YDtcbiAgICAgICAgICBjYXNlICdORSc6XG4gICAgICAgICAgICByZXR1cm4gYCR7YXR0ck5hbWV9IDw+ICR7Z2V0QXR0cmlidXRlVmFsdWUoY29uZGl0aW9uLnZhbHVlKX1gO1xuICAgICAgICAgIGNhc2UgJ0xUJzpcbiAgICAgICAgICAgIHJldHVybiBgJHthdHRyTmFtZX0gPCAke2dldEF0dHJpYnV0ZVZhbHVlKGNvbmRpdGlvbi52YWx1ZSl9YDtcbiAgICAgICAgICBjYXNlICdMRSc6XG4gICAgICAgICAgICByZXR1cm4gYCR7YXR0ck5hbWV9IDw9ICR7Z2V0QXR0cmlidXRlVmFsdWUoY29uZGl0aW9uLnZhbHVlKX1gO1xuICAgICAgICAgIGNhc2UgJ0dUJzpcbiAgICAgICAgICAgIHJldHVybiBgJHthdHRyTmFtZX0gPiAke2dldEF0dHJpYnV0ZVZhbHVlKGNvbmRpdGlvbi52YWx1ZSl9YDtcbiAgICAgICAgICBjYXNlICdHRSc6XG4gICAgICAgICAgICByZXR1cm4gYCR7YXR0ck5hbWV9ID49ICR7Z2V0QXR0cmlidXRlVmFsdWUoY29uZGl0aW9uLnZhbHVlKX1gO1xuICAgICAgICAgIGNhc2UgJ0JFR0lOU19XSVRIJzpcbiAgICAgICAgICAgIHJldHVybiBgYmVnaW5zX3dpdGgoJHthdHRyTmFtZX0sICR7Z2V0QXR0cmlidXRlVmFsdWUoY29uZGl0aW9uLnZhbHVlKX0pYDtcbiAgICAgICAgICBjYXNlICdDT05UQUlOUyc6XG4gICAgICAgICAgICByZXR1cm4gYGNvbnRhaW5zKCR7YXR0ck5hbWV9LCAke2dldEF0dHJpYnV0ZVZhbHVlKGNvbmRpdGlvbi52YWx1ZSl9KWA7XG4gICAgICAgICAgY2FzZSAnRVhJU1RTJzpcbiAgICAgICAgICAgIHJldHVybiBgYXR0cmlidXRlX2V4aXN0cygke2F0dHJOYW1lfSlgO1xuICAgICAgICAgIGNhc2UgJ05PVF9FWElTVFMnOlxuICAgICAgICAgICAgcmV0dXJuIGBhdHRyaWJ1dGVfbm90X2V4aXN0cygke2F0dHJOYW1lfSlgO1xuICAgICAgICAgIGNhc2UgJ0JFVFdFRU4nOlxuICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJOYW1lfSBCRVRXRUVOICR7Z2V0QXR0cmlidXRlVmFsdWUoY29uZGl0aW9uLnZhbHVlcyFbMF0pfSBBTkQgJHtnZXRBdHRyaWJ1dGVWYWx1ZShjb25kaXRpb24udmFsdWVzIVsxXSl9YDtcbiAgICAgICAgICBjYXNlICdJTic6XG4gICAgICAgICAgICBjb25zdCBpblZhbHVlcyA9IGNvbmRpdGlvbi52YWx1ZXMhLm1hcCh2ID0+IGdldEF0dHJpYnV0ZVZhbHVlKHYpKS5qb2luKCcsICcpO1xuICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJOYW1lfSBJTiAoJHtpblZhbHVlc30pYDtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBmaWx0ZXIgY29uZGl0aW9uIG9wZXJhdG9yOiAke2NvbmRpdGlvbi5vcGVyYXRvcn1gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBwYXJhbXMuZmlsdGVyRXhwcmVzc2lvbiA9IGZpbHRlckV4cHJlc3Npb25zLmpvaW4oJyBBTkQgJyk7XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgcHJvamVjdGlvbiBleHByZXNzaW9uXG4gICAgaWYgKHRoaXMucHJvamVjdGlvbkF0dHJpYnV0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgcGFyYW1zLnByb2plY3Rpb25FeHByZXNzaW9uID0gdGhpcy5wcm9qZWN0aW9uQXR0cmlidXRlc1xuICAgICAgICAubWFwKGF0dHIgPT4gZ2V0QXR0cmlidXRlTmFtZShhdHRyKSlcbiAgICAgICAgLmpvaW4oJywgJyk7XG4gICAgfVxuXG4gICAgLy8gQWRkIGV4cHJlc3Npb24gYXR0cmlidXRlIG5hbWVzIGFuZCB2YWx1ZXMgaWYgdGhleSBleGlzdFxuICAgIGlmIChPYmplY3Qua2V5cyhhdHRyaWJ1dGVOYW1lcykubGVuZ3RoID4gMCkge1xuICAgICAgcGFyYW1zLmV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcyA9IGF0dHJpYnV0ZU5hbWVzO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LmtleXMoYXR0cmlidXRlVmFsdWVzKS5sZW5ndGggPiAwKSB7XG4gICAgICBwYXJhbXMuZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyA9IGF0dHJpYnV0ZVZhbHVlcztcbiAgICB9XG5cbiAgICAvLyBBZGQgb3RoZXIgcGFyYW1ldGVyc1xuICAgIGlmICh0aGlzLmluZGV4TmFtZSkgcGFyYW1zLmluZGV4TmFtZSA9IHRoaXMuaW5kZXhOYW1lO1xuICAgIGlmICh0aGlzLmxpbWl0VmFsdWUpIHBhcmFtcy5saW1pdCA9IHRoaXMubGltaXRWYWx1ZTtcbiAgICBpZiAodGhpcy5leGNsdXNpdmVTdGFydEtleVZhbHVlKSBwYXJhbXMuZXhjbHVzaXZlU3RhcnRLZXkgPSB0aGlzLmV4Y2x1c2l2ZVN0YXJ0S2V5VmFsdWU7XG4gICAgaWYgKHRoaXMuY29uc2lzdGVudFJlYWRWYWx1ZSAhPT0gdW5kZWZpbmVkKSBwYXJhbXMuY29uc2lzdGVudFJlYWQgPSB0aGlzLmNvbnNpc3RlbnRSZWFkVmFsdWU7XG4gICAgaWYgKHRoaXMuc2NhbkluZGV4Rm9yd2FyZFZhbHVlICE9PSB1bmRlZmluZWQpIHBhcmFtcy5zY2FuSW5kZXhGb3J3YXJkID0gdGhpcy5zY2FuSW5kZXhGb3J3YXJkVmFsdWU7XG5cbiAgICByZXR1cm4gcGFyYW1zO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBxdWVyeSBidWlsZGVyIGluc3RhbmNlXG4gICAqL1xuICBzdGF0aWMgY3JlYXRlKCk6IER5bmFtb0RCUXVlcnlCdWlsZGVyIHtcbiAgICByZXR1cm4gbmV3IER5bmFtb0RCUXVlcnlCdWlsZGVyKCk7XG4gIH1cbn1cblxuLy8gQ29udmVuaWVuY2UgZnVuY3Rpb25zIGZvciBjb21tb24gcXVlcnkgcGF0dGVybnNcbmV4cG9ydCBjb25zdCBRdWVyeUJ1aWxkZXIgPSB7XG4gIC8qKlxuICAgKiBRdWVyeSBieSBwYXJ0aXRpb24ga2V5XG4gICAqL1xuICBieVBhcnRpdGlvbktleShwazogc3RyaW5nLCB2YWx1ZTogYW55KTogRHluYW1vREJRdWVyeUJ1aWxkZXIge1xuICAgIHJldHVybiBEeW5hbW9EQlF1ZXJ5QnVpbGRlci5jcmVhdGUoKS5wYXJ0aXRpb25LZXkocGssIHZhbHVlKTtcbiAgfSxcblxuICAvKipcbiAgICogUXVlcnkgYnkgcGFydGl0aW9uIGtleSBhbmQgc29ydCBrZXlcbiAgICovXG4gIGJ5S2V5cyhwazogc3RyaW5nLCBwa1ZhbHVlOiBhbnksIHNrOiBzdHJpbmcsIHNrVmFsdWU6IGFueSk6IER5bmFtb0RCUXVlcnlCdWlsZGVyIHtcbiAgICByZXR1cm4gRHluYW1vREJRdWVyeUJ1aWxkZXIuY3JlYXRlKClcbiAgICAgIC5wYXJ0aXRpb25LZXkocGssIHBrVmFsdWUpXG4gICAgICAuc29ydEtleShzaywgJ0VRJywgc2tWYWx1ZSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFF1ZXJ5IHdpdGggYmVnaW5zX3dpdGggb24gc29ydCBrZXlcbiAgICovXG4gIGJlZ2luc1dpdGgocGs6IHN0cmluZywgcGtWYWx1ZTogYW55LCBzazogc3RyaW5nLCBza1ByZWZpeDogc3RyaW5nKTogRHluYW1vREJRdWVyeUJ1aWxkZXIge1xuICAgIHJldHVybiBEeW5hbW9EQlF1ZXJ5QnVpbGRlci5jcmVhdGUoKVxuICAgICAgLnBhcnRpdGlvbktleShwaywgcGtWYWx1ZSlcbiAgICAgIC5iZWdpbnNXaXRoKHNrLCBza1ByZWZpeCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFF1ZXJ5IEdTSSBieSBwYXJ0aXRpb24ga2V5XG4gICAqL1xuICBnc2lCeVBhcnRpdGlvbktleShpbmRleE5hbWU6IHN0cmluZywgcGs6IHN0cmluZywgdmFsdWU6IGFueSk6IER5bmFtb0RCUXVlcnlCdWlsZGVyIHtcbiAgICByZXR1cm4gRHluYW1vREJRdWVyeUJ1aWxkZXIuY3JlYXRlKClcbiAgICAgIC51c2VJbmRleChpbmRleE5hbWUpXG4gICAgICAucGFydGl0aW9uS2V5KHBrLCB2YWx1ZSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFF1ZXJ5IEdTSSBieSBwYXJ0aXRpb24ga2V5IGFuZCBzb3J0IGtleVxuICAgKi9cbiAgZ3NpQnlLZXlzKGluZGV4TmFtZTogc3RyaW5nLCBwazogc3RyaW5nLCBwa1ZhbHVlOiBhbnksIHNrOiBzdHJpbmcsIHNrVmFsdWU6IGFueSk6IER5bmFtb0RCUXVlcnlCdWlsZGVyIHtcbiAgICByZXR1cm4gRHluYW1vREJRdWVyeUJ1aWxkZXIuY3JlYXRlKClcbiAgICAgIC51c2VJbmRleChpbmRleE5hbWUpXG4gICAgICAucGFydGl0aW9uS2V5KHBrLCBwa1ZhbHVlKVxuICAgICAgLnNvcnRLZXkoc2ssICdFUScsIHNrVmFsdWUpO1xuICB9LFxufTsiXX0=