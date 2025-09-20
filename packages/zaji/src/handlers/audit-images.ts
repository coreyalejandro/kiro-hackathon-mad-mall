import { TitanEngine } from '../service/titanengine';

const engine = TitanEngine.createDefault();

export async function handler() {
  await engine.auditImageAssets();
  return { statusCode: 200, body: 'audit complete' };
}
