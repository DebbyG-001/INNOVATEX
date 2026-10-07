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

export async function queryDatabase(text: string, params?: any[]): Promise<any> {
  const config = getDatabaseConfig();
  if (!config.isConfigured) {
    // Transparently indicate that external PostgreSQL is not attached in the current environment
    return {
      rows: [],
      rowCount: 0,
      simulated: true,
      message: 'PostgreSQL is not configured. Application is operating in simulated memory mode.',
    };
  }

  // When DATABASE_URL is supplied in production or Cloud SQL:
  try {
    // Dynamic import to avoid client-side bundling issues
    // @ts-ignore
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: config.connectionString,
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
    });
    const result = await pool.query(text, params);
    await pool.end();
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
