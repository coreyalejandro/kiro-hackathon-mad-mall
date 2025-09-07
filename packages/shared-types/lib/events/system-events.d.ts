/**
 * System Events
 * System-level events for monitoring, health checks, and operations
 */
import { IntegrationEvent } from './base';
export interface SystemHealthCheckEvent extends IntegrationEvent<{
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    timestamp: string;
    dependencies: {
        name: string;
        status: 'healthy' | 'degraded' | 'unhealthy';
        responseTime?: number;
        error?: string;
    }[];
}> {
    type: 'system.health_check';
}
export interface SystemErrorEvent extends IntegrationEvent<{
    service: string;
    error: {
        type: string;
        message: string;
        stack?: string;
        code?: string;
    };
    context: {
        userId?: string;
        requestId?: string;
        endpoint?: string;
        method?: string;
        userAgent?: string;
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
}> {
    type: 'system.error';
}
export interface SystemPerformanceEvent extends IntegrationEvent<{
    service: string;
    metrics: {
        responseTime: number;
        throughput: number;
        errorRate: number;
        cpuUsage?: number;
        memoryUsage?: number;
        diskUsage?: number;
    };
    period: 'minute' | 'hour' | 'day';
}> {
    type: 'system.performance';
}
export interface SystemDeploymentStartedEvent extends IntegrationEvent<{
    service: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    deployedBy: string;
    deploymentId: string;
    startedAt: string;
}> {
    type: 'system.deployment_started';
}
export interface SystemDeploymentCompletedEvent extends IntegrationEvent<{
    service: string;
    version: string;
    environment: string;
    deployedBy: string;
    deploymentId: string;
    startedAt: string;
    completedAt: string;
    duration: number;
    success: boolean;
    error?: string;
}> {
    type: 'system.deployment_completed';
}
export interface SystemConfigurationChangedEvent extends IntegrationEvent<{
    service: string;
    configKey: string;
    previousValue?: string;
    newValue: string;
    changedBy: string;
    environment: string;
    changedAt: string;
}> {
    type: 'system.configuration_changed';
}
export interface SystemSecurityAlertEvent extends IntegrationEvent<{
    alertType: 'suspicious_activity' | 'failed_authentication' | 'rate_limit_exceeded' | 'unauthorized_access';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    source: {
        ipAddress?: string;
        userAgent?: string;
        userId?: string;
        endpoint?: string;
    };
    metadata?: Record<string, any>;
}> {
    type: 'system.security_alert';
}
export interface SystemAuditEvent extends IntegrationEvent<{
    action: string;
    resource: string;
    resourceId?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    error?: string;
    metadata?: Record<string, any>;
}> {
    type: 'system.audit';
}
export interface SystemBackupStartedEvent extends IntegrationEvent<{
    backupType: 'full' | 'incremental' | 'differential';
    dataSource: string;
    backupId: string;
    startedAt: string;
    estimatedDuration?: number;
}> {
    type: 'system.backup_started';
}
export interface SystemBackupCompletedEvent extends IntegrationEvent<{
    backupType: string;
    dataSource: string;
    backupId: string;
    startedAt: string;
    completedAt: string;
    duration: number;
    success: boolean;
    size?: number;
    location?: string;
    error?: string;
}> {
    type: 'system.backup_completed';
}
export interface SystemDataMigrationEvent extends IntegrationEvent<{
    migrationType: 'schema_update' | 'data_migration' | 'index_rebuild';
    source: string;
    target: string;
    migrationId: string;
    status: 'started' | 'in_progress' | 'completed' | 'failed';
    progress?: number;
    recordsProcessed?: number;
    totalRecords?: number;
    error?: string;
}> {
    type: 'system.data_migration';
}
export interface SystemMaintenanceScheduledEvent extends IntegrationEvent<{
    maintenanceType: 'planned' | 'emergency';
    description: string;
    scheduledStart: string;
    scheduledEnd: string;
    affectedServices: string[];
    impact: 'none' | 'minimal' | 'moderate' | 'significant';
    scheduledBy: string;
}> {
    type: 'system.maintenance_scheduled';
}
export interface SystemMaintenanceStartedEvent extends IntegrationEvent<{
    maintenanceId: string;
    maintenanceType: string;
    description: string;
    startedAt: string;
    estimatedEnd: string;
    affectedServices: string[];
}> {
    type: 'system.maintenance_started';
}
export interface SystemMaintenanceCompletedEvent extends IntegrationEvent<{
    maintenanceId: string;
    maintenanceType: string;
    startedAt: string;
    completedAt: string;
    duration: number;
    success: boolean;
    notes?: string;
    affectedServices: string[];
}> {
    type: 'system.maintenance_completed';
}
export interface SystemScalingEvent extends IntegrationEvent<{
    service: string;
    scalingType: 'up' | 'down';
    trigger: 'cpu' | 'memory' | 'requests' | 'manual';
    previousInstances: number;
    newInstances: number;
    metrics: {
        cpu?: number;
        memory?: number;
        requests?: number;
    };
}> {
    type: 'system.scaling';
}
export type SystemEvent = SystemHealthCheckEvent | SystemErrorEvent | SystemPerformanceEvent | SystemDeploymentStartedEvent | SystemDeploymentCompletedEvent | SystemConfigurationChangedEvent | SystemSecurityAlertEvent | SystemAuditEvent | SystemBackupStartedEvent | SystemBackupCompletedEvent | SystemDataMigrationEvent | SystemMaintenanceScheduledEvent | SystemMaintenanceStartedEvent | SystemMaintenanceCompletedEvent | SystemScalingEvent;
//# sourceMappingURL=system-events.d.ts.map