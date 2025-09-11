"use strict";
/**
 * User DAO Implementation
 * Data access operations for User entities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDynamoDAO = void 0;
const base_dao_1 = require("./base-dao");
const database_1 = require("@madmall/shared-types/database");
const database_2 = require("@madmall/shared-types/database");
class UserDynamoDAO extends base_dao_1.BaseDynamoDAO {
    constructor(dynamoService) {
        super(dynamoService, 'USER');
    }
    /**
     * Entity-specific validation for users
     */
    validateEntitySpecific(entity) {
        return database_2.DataValidator.validateUser(entity);
    }
    /**
     * Get user by email address using GSI1
     */
    async getByEmail(email) {
        const result = await this.queryGSI('GSI1', `EMAIL#${email}`, undefined, {
            limit: 1,
        });
        return result.items.length > 0 ? result.items[0] : null;
    }
    /**
     * Get user's circles using the user partition
     */
    async getUserCircles(userId, options) {
        const keyConditionExpression = 'PK = :pk AND begins_with(SK, :skPrefix)';
        const expressionAttributeValues = {
            ':pk': `USER#${userId}`,
            ':skPrefix': 'CIRCLE#',
        };
        return await this.dynamoService.query(keyConditionExpression, {
            ...options,
            expressionAttributeValues: {
                ...expressionAttributeValues,
                ...options?.expressionAttributeValues,
            },
        });
    }
    /**
     * Search users by criteria using filters
     */
    async searchUsers(criteria, options) {
        // This is a complex search that would typically use a scan operation
        // For better performance, consider using OpenSearch or similar search service
        const filterExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};
        // Filter by cultural background
        if (criteria.culturalBackground && criteria.culturalBackground.length > 0) {
            const culturalFilters = criteria.culturalBackground.map((bg, index) => {
                const attrValue = `:culturalBg${index}`;
                expressionAttributeValues[attrValue] = bg;
                return `contains(#profile.#culturalBackground, ${attrValue})`;
            });
            filterExpressions.push(`(${culturalFilters.join(' OR ')})`);
            expressionAttributeNames['#profile'] = 'profile';
            expressionAttributeNames['#culturalBackground'] = 'culturalBackground';
        }
        // Filter by diagnosis stage
        if (criteria.diagnosisStage) {
            filterExpressions.push('#profile.#diagnosisStage = :diagnosisStage');
            expressionAttributeNames['#profile'] = 'profile';
            expressionAttributeNames['#diagnosisStage'] = 'diagnosisStage';
            expressionAttributeValues[':diagnosisStage'] = criteria.diagnosisStage;
        }
        // Filter by support needs
        if (criteria.supportNeeds && criteria.supportNeeds.length > 0) {
            const supportFilters = criteria.supportNeeds.map((need, index) => {
                const attrValue = `:supportNeed${index}`;
                expressionAttributeValues[attrValue] = need;
                return `contains(#profile.#supportNeeds, ${attrValue})`;
            });
            filterExpressions.push(`(${supportFilters.join(' OR ')})`);
            expressionAttributeNames['#profile'] = 'profile';
            expressionAttributeNames['#supportNeeds'] = 'supportNeeds';
        }
        // Filter by location
        if (criteria.location) {
            if (criteria.location.city) {
                filterExpressions.push('#profile.#location.#city = :city');
                expressionAttributeNames['#profile'] = 'profile';
                expressionAttributeNames['#location'] = 'location';
                expressionAttributeNames['#city'] = 'city';
                expressionAttributeValues[':city'] = criteria.location.city;
            }
            if (criteria.location.state) {
                filterExpressions.push('#profile.#location.#state = :state');
                expressionAttributeNames['#profile'] = 'profile';
                expressionAttributeNames['#location'] = 'location';
                expressionAttributeNames['#state'] = 'state';
                expressionAttributeValues[':state'] = criteria.location.state;
            }
            if (criteria.location.country) {
                filterExpressions.push('#profile.#location.#country = :country');
                expressionAttributeNames['#profile'] = 'profile';
                expressionAttributeNames['#location'] = 'location';
                expressionAttributeNames['#country'] = 'country';
                expressionAttributeValues[':country'] = criteria.location.country;
            }
        }
        // Use GSI1 to scan all users with entity type filter
        const keyConditionExpression = 'GSI1PK = :entityType';
        const baseExpressionAttributeValues = { ':entityType': 'USER' };
        const queryOptions = {
            ...options,
            indexName: 'GSI1',
            expressionAttributeNames: {
                ...expressionAttributeNames,
                ...options?.expressionAttributeNames,
            },
            expressionAttributeValues: {
                ...baseExpressionAttributeValues,
                ...expressionAttributeValues,
                ...options?.expressionAttributeValues,
            },
        };
        if (filterExpressions.length > 0) {
            const combinedFilter = filterExpressions.join(' AND ');
            queryOptions.filterExpression = options?.filterExpression
                ? `(${options.filterExpression}) AND (${combinedFilter})`
                : combinedFilter;
        }
        return await this.dynamoService.query(keyConditionExpression, queryOptions);
    }
    /**
     * Get users by tenant using GSI4
     */
    async getUsersByTenant(tenantId, options) {
        return await this.queryGSI('GSI4', `TENANT#${tenantId}#USERS`, undefined, options);
    }
    /**
     * Update user's last active timestamp
     */
    async updateLastActive(userId) {
        const now = new Date().toISOString();
        const { PK, SK } = database_1.KeyPatterns.USER_PROFILE(userId);
        await this.dynamoService.updateItem(PK, SK, {
            updateExpression: 'SET #profile.#lastActive = :lastActive, #updatedAt = :updatedAt',
            expressionAttributeNames: {
                '#profile': 'profile',
                '#lastActive': 'lastActive',
                '#updatedAt': 'updatedAt',
            },
            expressionAttributeValues: {
                ':lastActive': now,
                ':updatedAt': now,
            },
        });
    }
    /**
     * Increment user statistics
     */
    async incrementStats(userId, stats) {
        const { PK, SK } = database_1.KeyPatterns.USER_PROFILE(userId);
        const updateExpressions = [];
        const expressionAttributeNames = {
            '#updatedAt': 'updatedAt',
        };
        const expressionAttributeValues = {
            ':updatedAt': new Date().toISOString(),
        };
        // Build increment expressions for each stat
        Object.entries(stats).forEach(([statName, increment]) => {
            if (increment && increment !== 0) {
                const attrName = `#stats_${statName}`;
                const attrValue = `:${statName}`;
                updateExpressions.push(`#stats.${attrName} = if_not_exists(#stats.${attrName}, :zero) + ${attrValue}`);
                expressionAttributeNames['#stats'] = 'stats';
                expressionAttributeNames[attrName] = statName;
                expressionAttributeValues[attrValue] = increment;
                expressionAttributeValues[':zero'] = 0;
            }
        });
        if (updateExpressions.length > 0) {
            updateExpressions.push('#updatedAt = :updatedAt');
            await this.dynamoService.updateItem(PK, SK, {
                updateExpression: `SET ${updateExpressions.join(', ')}`,
                expressionAttributeNames,
                expressionAttributeValues,
            });
        }
    }
    /**
     * Create user with proper key generation
     */
    async create(item) {
        const now = new Date().toISOString();
        // Generate keys using patterns
        const { PK, SK } = database_1.KeyPatterns.USER_PROFILE(item.userId);
        const { GSI1PK, GSI1SK } = database_1.KeyPatterns.USER_BY_EMAIL(item.email, item.userId);
        const newUser = {
            ...item,
            PK,
            SK,
            GSI1PK,
            GSI1SK,
            GSI4PK: `TENANT#${item.tenantId || 'default'}#USERS`,
            GSI4SK: `CREATED#${now}`,
            entityType: 'USER',
            version: 1,
            createdAt: now,
            updatedAt: now,
        };
        // Validate before creating
        const validation = this.validateEntitySpecific(newUser);
        if (!validation.isValid) {
            throw new Error(`User validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        }
        // Check for duplicate email
        const existingUser = await this.getByEmail(item.email);
        if (existingUser) {
            throw new Error(`User with email ${item.email} already exists`);
        }
        return await this.dynamoService.putItem(newUser);
    }
    /**
     * Get user by ID (convenience method)
     */
    async getUserById(userId) {
        const { PK, SK } = database_1.KeyPatterns.USER_PROFILE(userId);
        return await this.getById(PK, SK);
    }
    /**
     * Update user profile
     */
    async updateProfile(userId, profileUpdates) {
        const { PK, SK } = database_1.KeyPatterns.USER_PROFILE(userId);
        const updateExpressions = [];
        const expressionAttributeNames = {
            '#updatedAt': 'updatedAt',
            '#version': 'version',
        };
        const expressionAttributeValues = {
            ':updatedAt': new Date().toISOString(),
            ':versionIncrement': 1,
        };
        // Build update expressions for profile fields
        Object.entries(profileUpdates).forEach(([field, value]) => {
            const attrName = `#profile_${field}`;
            const attrValue = `:profile_${field}`;
            updateExpressions.push(`#profile.${attrName} = ${attrValue}`);
            expressionAttributeNames['#profile'] = 'profile';
            expressionAttributeNames[attrName] = field;
            expressionAttributeValues[attrValue] = value;
        });
        updateExpressions.push('#updatedAt = :updatedAt');
        updateExpressions.push('#version = #version + :versionIncrement');
        return await this.dynamoService.updateItem(PK, SK, {
            updateExpression: `SET ${updateExpressions.join(', ')}`,
            expressionAttributeNames,
            expressionAttributeValues,
            returnValues: 'ALL_NEW',
        });
    }
    /**
     * Update user preferences
     */
    async updatePreferences(userId, preferencesUpdates) {
        const { PK, SK } = database_1.KeyPatterns.USER_PROFILE(userId);
        const updateExpressions = [];
        const expressionAttributeNames = {
            '#updatedAt': 'updatedAt',
            '#version': 'version',
        };
        const expressionAttributeValues = {
            ':updatedAt': new Date().toISOString(),
            ':versionIncrement': 1,
        };
        // Build update expressions for preference fields
        Object.entries(preferencesUpdates).forEach(([field, value]) => {
            const attrName = `#preferences_${field}`;
            const attrValue = `:preferences_${field}`;
            updateExpressions.push(`#preferences.${attrName} = ${attrValue}`);
            expressionAttributeNames['#preferences'] = 'preferences';
            expressionAttributeNames[attrName] = field;
            expressionAttributeValues[attrValue] = value;
        });
        updateExpressions.push('#updatedAt = :updatedAt');
        updateExpressions.push('#version = #version + :versionIncrement');
        return await this.dynamoService.updateItem(PK, SK, {
            updateExpression: `SET ${updateExpressions.join(', ')}`,
            expressionAttributeNames,
            expressionAttributeValues,
            returnValues: 'ALL_NEW',
        });
    }
}
exports.UserDynamoDAO = UserDynamoDAO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGFvL3VzZXItZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7OztBQUVILHlDQUEyQztBQUUzQyw2REFBaUc7QUFDakcsNkRBQWlGO0FBR2pGLE1BQWEsYUFBYyxTQUFRLHdCQUEyQjtJQUM1RCxZQUFZLGFBQThCO1FBQ3hDLEtBQUssQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVEOztPQUVHO0lBQ08sc0JBQXNCLENBQUMsTUFBb0I7UUFDbkQsT0FBTyx3QkFBYSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWE7UUFDNUIsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxTQUFTLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRTtZQUN0RSxLQUFLLEVBQUUsQ0FBQztTQUNULENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDMUQsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFjLEVBQUUsT0FBc0I7UUFDekQsTUFBTSxzQkFBc0IsR0FBRyx5Q0FBeUMsQ0FBQztRQUN6RSxNQUFNLHlCQUF5QixHQUFHO1lBQ2hDLEtBQUssRUFBRSxRQUFRLE1BQU0sRUFBRTtZQUN2QixXQUFXLEVBQUUsU0FBUztTQUN2QixDQUFDO1FBRUYsT0FBTyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUF1QixzQkFBc0IsRUFBRTtZQUNsRixHQUFHLE9BQU87WUFDVix5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LFNBQVM7U0FDeEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBblZELHNDQW1WQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVXNlciBEQU8gSW1wbGVtZW50YXRpb25cbiAqIERhdGEgYWNjZXNzIG9wZXJhdGlvbnMgZm9yIFVzZXIgZW50aXRpZXNcbiAqL1xuXG5pbXBvcnQgeyBCYXNlRHluYW1vREFPIH0gZnJvbSAnLi9iYXNlLWRhbyc7XG5pbXBvcnQgeyBVc2VyREFPLCBRdWVyeU9wdGlvbnMsIFF1ZXJ5UmVzdWx0IH0gZnJvbSAnQG1hZG1hbGwvc2hhcmVkLXR5cGVzL2RhdGFiYXNlJztcbmltcG9ydCB7IER5bmFtb0RCVXNlciwgRHluYW1vREJDaXJjbGVNZW1iZXIsIEtleVBhdHRlcm5zIH0gZnJvbSAnQG1hZG1hbGwvc2hhcmVkLXR5cGVzL2RhdGFiYXNlJztcbmltcG9ydCB7IERhdGFWYWxpZGF0b3IsIFZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICdAbWFkbWFsbC9zaGFyZWQtdHlwZXMvZGF0YWJhc2UnO1xuaW1wb3J0IHsgRHluYW1vREJTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvZHluYW1vZGItc2VydmljZSc7XG5cbmV4cG9ydCBjbGFzcyBVc2VyRHluYW1vREFPIGV4dGVuZHMgQmFzZUR5bmFtb0RBTzxEeW5hbW9EQlVzZXI+IGltcGxlbWVudHMgVXNlckRBTyB7XG4gIGNvbnN0cnVjdG9yKGR5bmFtb1NlcnZpY2U6IER5bmFtb0RCU2VydmljZSkge1xuICAgIHN1cGVyKGR5bmFtb1NlcnZpY2UsICdVU0VSJyk7XG4gIH1cblxuICAvKipcbiAgICogRW50aXR5LXNwZWNpZmljIHZhbGlkYXRpb24gZm9yIHVzZXJzXG4gICAqL1xuICBwcm90ZWN0ZWQgdmFsaWRhdGVFbnRpdHlTcGVjaWZpYyhlbnRpdHk6IER5bmFtb0RCVXNlcik6IFZhbGlkYXRpb25SZXN1bHQge1xuICAgIHJldHVybiBEYXRhVmFsaWRhdG9yLnZhbGlkYXRlVXNlcihlbnRpdHkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB1c2VyIGJ5IGVtYWlsIGFkZHJlc3MgdXNpbmcgR1NJMVxuICAgKi9cbiAgYXN5bmMgZ2V0QnlFbWFpbChlbWFpbDogc3RyaW5nKTogUHJvbWlzZTxEeW5hbW9EQlVzZXIgfCBudWxsPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5xdWVyeUdTSSgnR1NJMScsIGBFTUFJTCMke2VtYWlsfWAsIHVuZGVmaW5lZCwge1xuICAgICAgbGltaXQ6IDEsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0Lml0ZW1zLmxlbmd0aCA+IDAgPyByZXN1bHQuaXRlbXNbMF0gOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB1c2VyJ3MgY2lyY2xlcyB1c2luZyB0aGUgdXNlciBwYXJ0aXRpb25cbiAgICovXG4gIGFzeW5jIGdldFVzZXJDaXJjbGVzKHVzZXJJZDogc3RyaW5nLCBvcHRpb25zPzogUXVlcnlPcHRpb25zKTogUHJvbWlzZTxRdWVyeVJlc3VsdDxEeW5hbW9EQkNpcmNsZU1lbWJlcj4+IHtcbiAgICBjb25zdCBrZXlDb25kaXRpb25FeHByZXNzaW9uID0gJ1BLID0gOnBrIEFORCBiZWdpbnNfd2l0aChTSywgOnNrUHJlZml4KSc7XG4gICAgY29uc3QgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyA9IHtcbiAgICAgICc6cGsnOiBgVVNFUiMke3VzZXJJZH1gLFxuICAgICAgJzpza1ByZWZpeCc6ICdDSVJDTEUjJyxcbiAgICB9O1xuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZHluYW1vU2VydmljZS5xdWVyeTxEeW5hbW9EQkNpcmNsZU1lbWJlcj4oa2V5Q29uZGl0aW9uRXhwcmVzc2lvbiwge1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgLi4uZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyxcbiAgICAgICAgLi4ub3B0aW9ucz8uZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2VhcmNoIHVzZXJzIGJ5IGNyaXRlcmlhIHVzaW5nIGZpbHRlcnNcbiAgICovXG4gIGFzeW5jIHNlYXJjaFVzZXJzKGNyaXRlcmlhOiB7XG4gICAgY3VsdHVyYWxCYWNrZ3JvdW5kPzogc3RyaW5nW107XG4gICAgZGlhZ25vc2lzU3RhZ2U/OiBzdHJpbmc7XG4gICAgc3VwcG9ydE5lZWRzPzogc3RyaW5nW107XG4gICAgbG9jYXRpb24/OiB7IGNpdHk/OiBzdHJpbmc7IHN0YXRlPzogc3RyaW5nOyBjb3VudHJ5Pzogc3RyaW5nIH07XG4gIH0sIG9wdGlvbnM/OiBRdWVyeU9wdGlvbnMpOiBQcm9taXNlPFF1ZXJ5UmVzdWx0PER5bmFtb0RCVXNlcj4+IHtcbiAgICAvLyBUaGlzIGlzIGEgY29tcGxleCBzZWFyY2ggdGhhdCB3b3VsZCB0eXBpY2FsbHkgdXNlIGEgc2NhbiBvcGVyYXRpb25cbiAgICAvLyBGb3IgYmV0dGVyIHBlcmZvcm1hbmNlLCBjb25zaWRlciB1c2luZyBPcGVuU2VhcmNoIG9yIHNpbWlsYXIgc2VhcmNoIHNlcnZpY2VcbiAgICBcbiAgICBjb25zdCBmaWx0ZXJFeHByZXNzaW9uczogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBleHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICBjb25zdCBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cbiAgICAvLyBGaWx0ZXIgYnkgY3VsdHVyYWwgYmFja2dyb3VuZFxuICAgIGlmIChjcml0ZXJpYS5jdWx0dXJhbEJhY2tncm91bmQgJiYgY3JpdGVyaWEuY3VsdHVyYWxCYWNrZ3JvdW5kLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGN1bHR1cmFsRmlsdGVycyA9IGNyaXRlcmlhLmN1bHR1cmFsQmFja2dyb3VuZC5tYXAoKGJnLCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zdCBhdHRyVmFsdWUgPSBgOmN1bHR1cmFsQmcke2luZGV4fWA7XG4gICAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbYXR0clZhbHVlXSA9IGJnO1xuICAgICAgICByZXR1cm4gYGNvbnRhaW5zKCNwcm9maWxlLiNjdWx0dXJhbEJhY2tncm91bmQsICR7YXR0clZhbHVlfSlgO1xuICAgICAgfSk7XG4gICAgICBmaWx0ZXJFeHByZXNzaW9ucy5wdXNoKGAoJHtjdWx0dXJhbEZpbHRlcnMuam9pbignIE9SICcpfSlgKTtcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lc1snI3Byb2ZpbGUnXSA9ICdwcm9maWxlJztcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lc1snI2N1bHR1cmFsQmFja2dyb3VuZCddID0gJ2N1bHR1cmFsQmFja2dyb3VuZCc7XG4gICAgfVxuXG4gICAgLy8gRmlsdGVyIGJ5IGRpYWdub3NpcyBzdGFnZVxuICAgIGlmIChjcml0ZXJpYS5kaWFnbm9zaXNTdGFnZSkge1xuICAgICAgZmlsdGVyRXhwcmVzc2lvbnMucHVzaCgnI3Byb2ZpbGUuI2RpYWdub3Npc1N0YWdlID0gOmRpYWdub3Npc1N0YWdlJyk7XG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXNbJyNwcm9maWxlJ10gPSAncHJvZmlsZSc7XG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXNbJyNkaWFnbm9zaXNTdGFnZSddID0gJ2RpYWdub3Npc1N0YWdlJztcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbJzpkaWFnbm9zaXNTdGFnZSddID0gY3JpdGVyaWEuZGlhZ25vc2lzU3RhZ2U7XG4gICAgfVxuXG4gICAgLy8gRmlsdGVyIGJ5IHN1cHBvcnQgbmVlZHNcbiAgICBpZiAoY3JpdGVyaWEuc3VwcG9ydE5lZWRzICYmIGNyaXRlcmlhLnN1cHBvcnROZWVkcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBzdXBwb3J0RmlsdGVycyA9IGNyaXRlcmlhLnN1cHBvcnROZWVkcy5tYXAoKG5lZWQsIGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IGF0dHJWYWx1ZSA9IGA6c3VwcG9ydE5lZWQke2luZGV4fWA7XG4gICAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbYXR0clZhbHVlXSA9IG5lZWQ7XG4gICAgICAgIHJldHVybiBgY29udGFpbnMoI3Byb2ZpbGUuI3N1cHBvcnROZWVkcywgJHthdHRyVmFsdWV9KWA7XG4gICAgICB9KTtcbiAgICAgIGZpbHRlckV4cHJlc3Npb25zLnB1c2goYCgke3N1cHBvcnRGaWx0ZXJzLmpvaW4oJyBPUiAnKX0pYCk7XG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXNbJyNwcm9maWxlJ10gPSAncHJvZmlsZSc7XG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXNbJyNzdXBwb3J0TmVlZHMnXSA9ICdzdXBwb3J0TmVlZHMnO1xuICAgIH1cblxuICAgIC8vIEZpbHRlciBieSBsb2NhdGlvblxuICAgIGlmIChjcml0ZXJpYS5sb2NhdGlvbikge1xuICAgICAgaWYgKGNyaXRlcmlhLmxvY2F0aW9uLmNpdHkpIHtcbiAgICAgICAgZmlsdGVyRXhwcmVzc2lvbnMucHVzaCgnI3Byb2ZpbGUuI2xvY2F0aW9uLiNjaXR5ID0gOmNpdHknKTtcbiAgICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzWycjcHJvZmlsZSddID0gJ3Byb2ZpbGUnO1xuICAgICAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXNbJyNsb2NhdGlvbiddID0gJ2xvY2F0aW9uJztcbiAgICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzWycjY2l0eSddID0gJ2NpdHknO1xuICAgICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzWyc6Y2l0eSddID0gY3JpdGVyaWEubG9jYXRpb24uY2l0eTtcbiAgICAgIH1cbiAgICAgIGlmIChjcml0ZXJpYS5sb2NhdGlvbi5zdGF0ZSkge1xuICAgICAgICBmaWx0ZXJFeHByZXNzaW9ucy5wdXNoKCcjcHJvZmlsZS4jbG9jYXRpb24uI3N0YXRlID0gOnN0YXRlJyk7XG4gICAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lc1snI3Byb2ZpbGUnXSA9ICdwcm9maWxlJztcbiAgICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzWycjbG9jYXRpb24nXSA9ICdsb2NhdGlvbic7XG4gICAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lc1snI3N0YXRlJ10gPSAnc3RhdGUnO1xuICAgICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzWyc6c3RhdGUnXSA9IGNyaXRlcmlhLmxvY2F0aW9uLnN0YXRlO1xuICAgICAgfVxuICAgICAgaWYgKGNyaXRlcmlhLmxvY2F0aW9uLmNvdW50cnkpIHtcbiAgICAgICAgZmlsdGVyRXhwcmVzc2lvbnMucHVzaCgnI3Byb2ZpbGUuI2xvY2F0aW9uLiNjb3VudHJ5ID0gOmNvdW50cnknKTtcbiAgICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzWycjcHJvZmlsZSddID0gJ3Byb2ZpbGUnO1xuICAgICAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXNbJyNsb2NhdGlvbiddID0gJ2xvY2F0aW9uJztcbiAgICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzWycjY291bnRyeSddID0gJ2NvdW50cnknO1xuICAgICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzWyc6Y291bnRyeSddID0gY3JpdGVyaWEubG9jYXRpb24uY291bnRyeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBVc2UgR1NJMSB0byBzY2FuIGFsbCB1c2VycyB3aXRoIGVudGl0eSB0eXBlIGZpbHRlclxuICAgIGNvbnN0IGtleUNvbmRpdGlvbkV4cHJlc3Npb24gPSAnR1NJMVBLID0gOmVudGl0eVR5cGUnO1xuICAgIGNvbnN0IGJhc2VFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzID0geyAnOmVudGl0eVR5cGUnOiAnVVNFUicgfTtcblxuICAgIGNvbnN0IHF1ZXJ5T3B0aW9uczogUXVlcnlPcHRpb25zID0ge1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIGluZGV4TmFtZTogJ0dTSTEnLFxuICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgIC4uLmV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcyxcbiAgICAgICAgLi4ub3B0aW9ucz8uZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzLFxuICAgICAgfSxcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgLi4uYmFzZUV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXMsXG4gICAgICAgIC4uLmV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXMsXG4gICAgICAgIC4uLm9wdGlvbnM/LmV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXMsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICBpZiAoZmlsdGVyRXhwcmVzc2lvbnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgY29tYmluZWRGaWx0ZXIgPSBmaWx0ZXJFeHByZXNzaW9ucy5qb2luKCcgQU5EICcpO1xuICAgICAgcXVlcnlPcHRpb25zLmZpbHRlckV4cHJlc3Npb24gPSBvcHRpb25zPy5maWx0ZXJFeHByZXNzaW9uIFxuICAgICAgICA/IGAoJHtvcHRpb25zLmZpbHRlckV4cHJlc3Npb259KSBBTkQgKCR7Y29tYmluZWRGaWx0ZXJ9KWBcbiAgICAgICAgOiBjb21iaW5lZEZpbHRlcjtcbiAgICB9XG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5keW5hbW9TZXJ2aWNlLnF1ZXJ5PER5bmFtb0RCVXNlcj4oa2V5Q29uZGl0aW9uRXhwcmVzc2lvbiwgcXVlcnlPcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdXNlcnMgYnkgdGVuYW50IHVzaW5nIEdTSTRcbiAgICovXG4gIGFzeW5jIGdldFVzZXJzQnlUZW5hbnQodGVuYW50SWQ6IHN0cmluZywgb3B0aW9ucz86IFF1ZXJ5T3B0aW9ucyk6IFByb21pc2U8UXVlcnlSZXN1bHQ8RHluYW1vREJVc2VyPj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnF1ZXJ5R1NJKCdHU0k0JywgYFRFTkFOVCMke3RlbmFudElkfSNVU0VSU2AsIHVuZGVmaW5lZCwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHVzZXIncyBsYXN0IGFjdGl2ZSB0aW1lc3RhbXBcbiAgICovXG4gIGFzeW5jIHVwZGF0ZUxhc3RBY3RpdmUodXNlcklkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgY29uc3QgeyBQSywgU0sgfSA9IEtleVBhdHRlcm5zLlVTRVJfUFJPRklMRSh1c2VySWQpO1xuXG4gICAgYXdhaXQgdGhpcy5keW5hbW9TZXJ2aWNlLnVwZGF0ZUl0ZW0oUEssIFNLLCB7XG4gICAgICB1cGRhdGVFeHByZXNzaW9uOiAnU0VUICNwcm9maWxlLiNsYXN0QWN0aXZlID0gOmxhc3RBY3RpdmUsICN1cGRhdGVkQXQgPSA6dXBkYXRlZEF0JyxcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAnI3Byb2ZpbGUnOiAncHJvZmlsZScsXG4gICAgICAgICcjbGFzdEFjdGl2ZSc6ICdsYXN0QWN0aXZlJyxcbiAgICAgICAgJyN1cGRhdGVkQXQnOiAndXBkYXRlZEF0JyxcbiAgICAgIH0sXG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICc6bGFzdEFjdGl2ZSc6IG5vdyxcbiAgICAgICAgJzp1cGRhdGVkQXQnOiBub3csXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluY3JlbWVudCB1c2VyIHN0YXRpc3RpY3NcbiAgICovXG4gIGFzeW5jIGluY3JlbWVudFN0YXRzKHVzZXJJZDogc3RyaW5nLCBzdGF0czogUGFydGlhbDx7XG4gICAgc3Rvcmllc1NoYXJlZDogbnVtYmVyO1xuICAgIGNpcmNsZXNKb2luZWQ6IG51bWJlcjtcbiAgICBjb21tZW50c1Bvc3RlZDogbnVtYmVyO1xuICAgIGhlbHBmdWxWb3RlczogbnVtYmVyO1xuICAgIGRheXNBY3RpdmU6IG51bWJlcjtcbiAgICBzdHJlYWtEYXlzOiBudW1iZXI7XG4gIH0+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgeyBQSywgU0sgfSA9IEtleVBhdHRlcm5zLlVTRVJfUFJPRklMRSh1c2VySWQpO1xuICAgIFxuICAgIGNvbnN0IHVwZGF0ZUV4cHJlc3Npb25zOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICcjdXBkYXRlZEF0JzogJ3VwZGF0ZWRBdCcsXG4gICAgfTtcbiAgICBjb25zdCBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge1xuICAgICAgJzp1cGRhdGVkQXQnOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgfTtcblxuICAgIC8vIEJ1aWxkIGluY3JlbWVudCBleHByZXNzaW9ucyBmb3IgZWFjaCBzdGF0XG4gICAgT2JqZWN0LmVudHJpZXMoc3RhdHMpLmZvckVhY2goKFtzdGF0TmFtZSwgaW5jcmVtZW50XSkgPT4ge1xuICAgICAgaWYgKGluY3JlbWVudCAmJiBpbmNyZW1lbnQgIT09IDApIHtcbiAgICAgICAgY29uc3QgYXR0ck5hbWUgPSBgI3N0YXRzXyR7c3RhdE5hbWV9YDtcbiAgICAgICAgY29uc3QgYXR0clZhbHVlID0gYDoke3N0YXROYW1lfWA7XG4gICAgICAgIFxuICAgICAgICB1cGRhdGVFeHByZXNzaW9ucy5wdXNoKGAjc3RhdHMuJHthdHRyTmFtZX0gPSBpZl9ub3RfZXhpc3RzKCNzdGF0cy4ke2F0dHJOYW1lfSwgOnplcm8pICsgJHthdHRyVmFsdWV9YCk7XG4gICAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lc1snI3N0YXRzJ10gPSAnc3RhdHMnO1xuICAgICAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXNbYXR0ck5hbWVdID0gc3RhdE5hbWU7XG4gICAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbYXR0clZhbHVlXSA9IGluY3JlbWVudDtcbiAgICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlc1snOnplcm8nXSA9IDA7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodXBkYXRlRXhwcmVzc2lvbnMubGVuZ3RoID4gMCkge1xuICAgICAgdXBkYXRlRXhwcmVzc2lvbnMucHVzaCgnI3VwZGF0ZWRBdCA9IDp1cGRhdGVkQXQnKTtcblxuICAgICAgYXdhaXQgdGhpcy5keW5hbW9TZXJ2aWNlLnVwZGF0ZUl0ZW0oUEssIFNLLCB7XG4gICAgICAgIHVwZGF0ZUV4cHJlc3Npb246IGBTRVQgJHt1cGRhdGVFeHByZXNzaW9ucy5qb2luKCcsICcpfWAsXG4gICAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcyxcbiAgICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgdXNlciB3aXRoIHByb3BlciBrZXkgZ2VuZXJhdGlvblxuICAgKi9cbiAgYXN5bmMgY3JlYXRlKGl0ZW06IE9taXQ8RHluYW1vREJVc2VyLCAnY3JlYXRlZEF0JyB8ICd1cGRhdGVkQXQnIHwgJ3ZlcnNpb24nPik6IFByb21pc2U8RHluYW1vREJVc2VyPiB7XG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgIFxuICAgIC8vIEdlbmVyYXRlIGtleXMgdXNpbmcgcGF0dGVybnNcbiAgICBjb25zdCB7IFBLLCBTSyB9ID0gS2V5UGF0dGVybnMuVVNFUl9QUk9GSUxFKGl0ZW0udXNlcklkKTtcbiAgICBjb25zdCB7IEdTSTFQSywgR1NJMVNLIH0gPSBLZXlQYXR0ZXJucy5VU0VSX0JZX0VNQUlMKGl0ZW0uZW1haWwsIGl0ZW0udXNlcklkKTtcbiAgICBcbiAgICBjb25zdCBuZXdVc2VyOiBEeW5hbW9EQlVzZXIgPSB7XG4gICAgICAuLi5pdGVtLFxuICAgICAgUEssXG4gICAgICBTSyxcbiAgICAgIEdTSTFQSyxcbiAgICAgIEdTSTFTSyxcbiAgICAgIEdTSTRQSzogYFRFTkFOVCMkeyhpdGVtIGFzIGFueSkudGVuYW50SWQgfHwgJ2RlZmF1bHQnfSNVU0VSU2AsXG4gICAgICBHU0k0U0s6IGBDUkVBVEVEIyR7bm93fWAsXG4gICAgICBlbnRpdHlUeXBlOiAnVVNFUicsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAgY3JlYXRlZEF0OiBub3csXG4gICAgICB1cGRhdGVkQXQ6IG5vdyxcbiAgICB9O1xuXG4gICAgLy8gVmFsaWRhdGUgYmVmb3JlIGNyZWF0aW5nXG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHRoaXMudmFsaWRhdGVFbnRpdHlTcGVjaWZpYyhuZXdVc2VyKTtcbiAgICBpZiAoIXZhbGlkYXRpb24uaXNWYWxpZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVc2VyIHZhbGlkYXRpb24gZmFpbGVkOiAke3ZhbGlkYXRpb24uZXJyb3JzLm1hcChlID0+IGUubWVzc2FnZSkuam9pbignLCAnKX1gKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgZHVwbGljYXRlIGVtYWlsXG4gICAgY29uc3QgZXhpc3RpbmdVc2VyID0gYXdhaXQgdGhpcy5nZXRCeUVtYWlsKGl0ZW0uZW1haWwpO1xuICAgIGlmIChleGlzdGluZ1VzZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVXNlciB3aXRoIGVtYWlsICR7aXRlbS5lbWFpbH0gYWxyZWFkeSBleGlzdHNgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5keW5hbW9TZXJ2aWNlLnB1dEl0ZW0obmV3VXNlcik7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHVzZXIgYnkgSUQgKGNvbnZlbmllbmNlIG1ldGhvZClcbiAgICovXG4gIGFzeW5jIGdldFVzZXJCeUlkKHVzZXJJZDogc3RyaW5nKTogUHJvbWlzZTxEeW5hbW9EQlVzZXIgfCBudWxsPiB7XG4gICAgY29uc3QgeyBQSywgU0sgfSA9IEtleVBhdHRlcm5zLlVTRVJfUFJPRklMRSh1c2VySWQpO1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldEJ5SWQoUEssIFNLKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdXNlciBwcm9maWxlXG4gICAqL1xuICBhc3luYyB1cGRhdGVQcm9maWxlKHVzZXJJZDogc3RyaW5nLCBwcm9maWxlVXBkYXRlczogUGFydGlhbDxEeW5hbW9EQlVzZXJbJ3Byb2ZpbGUnXT4pOiBQcm9taXNlPER5bmFtb0RCVXNlcj4ge1xuICAgIGNvbnN0IHsgUEssIFNLIH0gPSBLZXlQYXR0ZXJucy5VU0VSX1BST0ZJTEUodXNlcklkKTtcbiAgICBcbiAgICBjb25zdCB1cGRhdGVFeHByZXNzaW9uczogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBleHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAnI3VwZGF0ZWRBdCc6ICd1cGRhdGVkQXQnLFxuICAgICAgJyN2ZXJzaW9uJzogJ3ZlcnNpb24nLFxuICAgIH07XG4gICAgY29uc3QgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogUmVjb3JkPHN0cmluZywgYW55PiA9IHtcbiAgICAgICc6dXBkYXRlZEF0JzogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgJzp2ZXJzaW9uSW5jcmVtZW50JzogMSxcbiAgICB9O1xuXG4gICAgLy8gQnVpbGQgdXBkYXRlIGV4cHJlc3Npb25zIGZvciBwcm9maWxlIGZpZWxkc1xuICAgIE9iamVjdC5lbnRyaWVzKHByb2ZpbGVVcGRhdGVzKS5mb3JFYWNoKChbZmllbGQsIHZhbHVlXSkgPT4ge1xuICAgICAgY29uc3QgYXR0ck5hbWUgPSBgI3Byb2ZpbGVfJHtmaWVsZH1gO1xuICAgICAgY29uc3QgYXR0clZhbHVlID0gYDpwcm9maWxlXyR7ZmllbGR9YDtcbiAgICAgIFxuICAgICAgdXBkYXRlRXhwcmVzc2lvbnMucHVzaChgI3Byb2ZpbGUuJHthdHRyTmFtZX0gPSAke2F0dHJWYWx1ZX1gKTtcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lc1snI3Byb2ZpbGUnXSA9ICdwcm9maWxlJztcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lc1thdHRyTmFtZV0gPSBmaWVsZDtcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbYXR0clZhbHVlXSA9IHZhbHVlO1xuICAgIH0pO1xuXG4gICAgdXBkYXRlRXhwcmVzc2lvbnMucHVzaCgnI3VwZGF0ZWRBdCA9IDp1cGRhdGVkQXQnKTtcbiAgICB1cGRhdGVFeHByZXNzaW9ucy5wdXNoKCcjdmVyc2lvbiA9ICN2ZXJzaW9uICsgOnZlcnNpb25JbmNyZW1lbnQnKTtcblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmR5bmFtb1NlcnZpY2UudXBkYXRlSXRlbTxEeW5hbW9EQlVzZXI+KFBLLCBTSywge1xuICAgICAgdXBkYXRlRXhwcmVzc2lvbjogYFNFVCAke3VwZGF0ZUV4cHJlc3Npb25zLmpvaW4oJywgJyl9YCxcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcyxcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXMsXG4gICAgICByZXR1cm5WYWx1ZXM6ICdBTExfTkVXJyxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdXNlciBwcmVmZXJlbmNlc1xuICAgKi9cbiAgYXN5bmMgdXBkYXRlUHJlZmVyZW5jZXModXNlcklkOiBzdHJpbmcsIHByZWZlcmVuY2VzVXBkYXRlczogUGFydGlhbDxEeW5hbW9EQlVzZXJbJ3ByZWZlcmVuY2VzJ10+KTogUHJvbWlzZTxEeW5hbW9EQlVzZXI+IHtcbiAgICBjb25zdCB7IFBLLCBTSyB9ID0gS2V5UGF0dGVybnMuVVNFUl9QUk9GSUxFKHVzZXJJZCk7XG4gICAgXG4gICAgY29uc3QgdXBkYXRlRXhwcmVzc2lvbnM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgJyN1cGRhdGVkQXQnOiAndXBkYXRlZEF0JyxcbiAgICAgICcjdmVyc2lvbic6ICd2ZXJzaW9uJyxcbiAgICB9O1xuICAgIGNvbnN0IGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7XG4gICAgICAnOnVwZGF0ZWRBdCc6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICc6dmVyc2lvbkluY3JlbWVudCc6IDEsXG4gICAgfTtcblxuICAgIC8vIEJ1aWxkIHVwZGF0ZSBleHByZXNzaW9ucyBmb3IgcHJlZmVyZW5jZSBmaWVsZHNcbiAgICBPYmplY3QuZW50cmllcyhwcmVmZXJlbmNlc1VwZGF0ZXMpLmZvckVhY2goKFtmaWVsZCwgdmFsdWVdKSA9PiB7XG4gICAgICBjb25zdCBhdHRyTmFtZSA9IGAjcHJlZmVyZW5jZXNfJHtmaWVsZH1gO1xuICAgICAgY29uc3QgYXR0clZhbHVlID0gYDpwcmVmZXJlbmNlc18ke2ZpZWxkfWA7XG4gICAgICBcbiAgICAgIHVwZGF0ZUV4cHJlc3Npb25zLnB1c2goYCNwcmVmZXJlbmNlcy4ke2F0dHJOYW1lfSA9ICR7YXR0clZhbHVlfWApO1xuICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzWycjcHJlZmVyZW5jZXMnXSA9ICdwcmVmZXJlbmNlcyc7XG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXNbYXR0ck5hbWVdID0gZmllbGQ7XG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzW2F0dHJWYWx1ZV0gPSB2YWx1ZTtcbiAgICB9KTtcblxuICAgIHVwZGF0ZUV4cHJlc3Npb25zLnB1c2goJyN1cGRhdGVkQXQgPSA6dXBkYXRlZEF0Jyk7XG4gICAgdXBkYXRlRXhwcmVzc2lvbnMucHVzaCgnI3ZlcnNpb24gPSAjdmVyc2lvbiArIDp2ZXJzaW9uSW5jcmVtZW50Jyk7XG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5keW5hbW9TZXJ2aWNlLnVwZGF0ZUl0ZW08RHluYW1vREJVc2VyPihQSywgU0ssIHtcbiAgICAgIHVwZGF0ZUV4cHJlc3Npb246IGBTRVQgJHt1cGRhdGVFeHByZXNzaW9ucy5qb2luKCcsICcpfWAsXG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXMsXG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzLFxuICAgICAgcmV0dXJuVmFsdWVzOiAnQUxMX05FVycsXG4gICAgfSk7XG4gIH1cbn0iXX0=