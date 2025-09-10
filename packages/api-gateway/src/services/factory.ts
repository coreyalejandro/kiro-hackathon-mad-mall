// Lightweight runtime DAO factory loader to avoid compile-time package coupling
// Uses dynamic require to load infrastructure package if available at runtime

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function require(name: string): any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any;

export function getDAOFactory() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const infra = require('@madmall/infrastructure');
    const env = process?.env?.NODE_ENV === 'production' ? 'production' : 'development';
    return infra.createDAOFactory(env);
  } catch (_err) {
    return null;
  }
}

