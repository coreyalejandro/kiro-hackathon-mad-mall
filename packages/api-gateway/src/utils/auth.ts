import { APIGatewayProxyEvent } from 'aws-lambda';

export interface AuthContext {
  sub: string;
  email?: string;
  groups: string[];
  tenantId?: string;
}

export function getAuthContext(event: APIGatewayProxyEvent): AuthContext | null {
  const claims = (event.requestContext.authorizer as any)?.claims || (event.requestContext.authorizer as any);
  if (!claims) return null;
  const groupsClaim = claims['cognito:groups'] || claims['groups'] || '';
  const groups = Array.isArray(groupsClaim)
    ? groupsClaim
    : typeof groupsClaim === 'string' && groupsClaim.length
      ? groupsClaim.split(',')
      : [];
  return {
    sub: claims['sub'],
    email: claims['email'],
    groups,
    tenantId: claims['custom:tenantId'] || claims['tenantId'],
  };
}

export function requireAnyGroup(event: APIGatewayProxyEvent, allowedGroups: string[]): AuthContext {
  const ctx = getAuthContext(event);
  if (!ctx) {
    const err: any = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }
  const hasAccess = ctx.groups.some(g => allowedGroups.includes(g));
  if (!hasAccess) {
    const err: any = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }
  return ctx;
}

