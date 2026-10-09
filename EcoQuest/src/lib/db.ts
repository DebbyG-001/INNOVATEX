/**
 * EcoQuest Database Architecture
 *
 * This file provides server-side PostgreSQL integration when DATABASE_URL is configured.
 * Per project specifications:
 * - We do NOT claim PostgreSQL is active unless DATABASE_URL is provided.
 * - We do NOT silently replace PostgreSQL with localStorage and claim it is a database.
 * - Credentials are never exposed to the client or hardcoded.
 */

export interface DatabaseConfig {
  connectionString?: string;
  isConfigured: boolean;
  ssl?: boolean;
}

export function getDatabaseConfig(): DatabaseConfig {
  const connectionString = process.env.DATABASE_URL;
  return {
    connectionString,
    isConfigured: Boolean(connectionString && connectionString.startsWith('postgres')),
    ssl: process.env.NODE_ENV === 'production',
  };
}

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: any | undefined;
}

let productionPool: any | undefined;

export async function getDbPool() {
  const config = getDatabaseConfig();
  if (!config.isConfigured) return null;

  if (process.env.NODE_ENV === 'production') {
    if (!productionPool) {
      // @ts-ignore
      const { Pool } = await import('pg');
      productionPool = new Pool({
        connectionString: config.connectionString,
        ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
      });
    }
    return productionPool;
  } else {
    if (!global._pgPool) {
      // @ts-ignore
      const { Pool } = await import('pg');
      global._pgPool = new Pool({
        connectionString: config.connectionString,
        ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
      });
    }
    return global._pgPool;
  }
}

export async function queryDatabase(text: string, params?: any[]): Promise<any> {
  const pool = await getDbPool();
  if (!pool) {
    // Transparently indicate that external PostgreSQL is not attached in the current environment
    return {
      rows: [],
      rowCount: 0,
      simulated: true,
      message: 'PostgreSQL is not configured. Application is operating in simulated memory mode.',
    };
  }

  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function withTransaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T | { simulated: true; message: string }> {
  const pool = await getDbPool();
  if (!pool) {
    return {
      simulated: true,
      message: 'PostgreSQL is not configured.',
    };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}
