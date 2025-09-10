/**
 * Incident DAO Implementation
 * Cultural sensitivity and moderation incident tracking
 */

import { BaseDynamoDAO } from './base-dao';
import { QueryOptions, QueryResult } from '@madmall/shared-types';
import { DynamoDBIncident, KeyPatterns } from '@madmall/shared-types';
import { DataValidator, ValidationResult, ValidationError } from '@madmall/shared-types';
import { DynamoDBService } from '../services/dynamodb-service';

export class IncidentDynamoDAO extends BaseDynamoDAO<DynamoDBIncident> {
  constructor(dynamoService: DynamoDBService) {
    super(dynamoService, 'INCIDENT');
  }

  protected validateEntitySpecific(entity: DynamoDBIncident): ValidationResult {
    return DataValidator.validateIncident(entity);
  }

  async createIncident(input: Omit<DynamoDBIncident, 'createdAt' | 'updatedAt' | 'version' | 'PK' | 'SK'>): Promise<DynamoDBIncident> {
    const now = new Date().toISOString();
    const keys = KeyPatterns.INCIDENT_METADATA(input.incidentId);
    const item: DynamoDBIncident = {
      ...input,
      ...keys,
      entityType: 'INCIDENT',
      version: 1,
      createdAt: now,
      updatedAt: now,
    } as DynamoDBIncident;

    const validation = this.validateEntity(item);
    if (!validation.isValid) {
      throw new Error(`Incident validation failed: ${validation.errors.map((e: ValidationError) => e.message).join(', ')}`);
    }

    return await this.dynamoService.putItem(item);
  }

  async getByStatus(status: string, options?: QueryOptions): Promise<QueryResult<DynamoDBIncident>> {
    return await this.queryGSI('GSI3', `INCIDENT_STATUS#${status}`, undefined, options);
  }

  async updateStatus(incidentId: string, status: DynamoDBIncident['status']): Promise<DynamoDBIncident> {
    const { PK, SK } = KeyPatterns.INCIDENT_METADATA(incidentId);
    return await this.dynamoService.updateItem<DynamoDBIncident>(PK, SK, {
      updateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
      expressionAttributeNames: { '#status': 'status', '#updatedAt': 'updatedAt' },
      expressionAttributeValues: { ':status': status, ':updatedAt': new Date().toISOString() },
      returnValues: 'ALL_NEW',
    });
  }
}

