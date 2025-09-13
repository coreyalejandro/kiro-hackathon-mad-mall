/* eslint-disable no-console */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { APIGatewayProxyEvent } from 'aws-lambda';

async function main(): Promise<void> {
  const handlerName = process.env.HANDLER || 'healthHandler';
  const eventPath = process.env.EVENT_PATH || resolve(__dirname, 'event.json');

  // Dynamic import of the handlers index which re-exports all named handlers
  const handlers = await import('../src/handlers');
  const handler = (handlers as Record<string, unknown>)[handlerName];

  if (typeof handler !== 'function') {
    console.error(`Handler "${handlerName}" not found. Available: ${Object.keys(handlers).join(', ')}`);
    process.exit(1);
  }

  const event: APIGatewayProxyEvent = JSON.parse(readFileSync(eventPath, 'utf-8')) as APIGatewayProxyEvent;

  console.log(`Invoking handler: ${handlerName}`);
  const result = await (handler as (e: APIGatewayProxyEvent) => Promise<unknown>)(event);
  console.log('Result:', JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

