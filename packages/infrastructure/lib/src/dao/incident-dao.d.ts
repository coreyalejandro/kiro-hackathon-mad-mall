/**
 * Incident DAO Implementation
 * Cultural sensitivity and moderation incident tracking
 */
import { BaseDynamoDAO } from './base-dao';
import { QueryOptions, QueryResult } from '@madmall/shared-types';
import { DynamoDBIncident } from '@madmall/shared-types';
import { ValidationResult } from '@madmall/shared-types';
import { DynamoDBService } from '../services/dynamodb-service';
export declare class IncidentDynamoDAO extends BaseDynamoDAO<DynamoDBIncident> {
    constructor(dynamoService: DynamoDBService);
    protected validateEntitySpecific(entity: DynamoDBIncident): ValidationResult;
    createIncident(input: Omit<DynamoDBIncident, 'createdAt' | 'updatedAt' | 'version' | 'PK' | 'SK'>): Promise<DynamoDBIncident>;
    getByStatus(status: string, options?: QueryOptions): Promise<QueryResult<DynamoDBIncident>>;
    updateStatus(incidentId: string, status: DynamoDBIncident['status']): Promise<DynamoDBIncident>;
}
