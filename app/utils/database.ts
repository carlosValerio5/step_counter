import type { SQLiteDatabase } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'step_tracker.db';
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Opens or creates a connection to the SQLite database
 * @returns Promise<SQLite.SQLiteDatabase> The database connection
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  try {
    // Open or create the database
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    
    // Enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');
    
    console.log('✅ Database connection established');
    return db;
  } catch (error) {
    console.error('❌ Error opening database:', error);
    throw error;
  }
}

/**
 * Closes the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log('Database connection closed');
  }
}

/**
 * Executes a SQL migration file
 * @param sql The SQL migration string
 */
export async function runMigration(sql: string): Promise<void> {
  try {
    const database = await getDatabase();
    
    // Split SQL statements by semicolon and execute each one
    const statements = sql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement) {
        await database.execAsync(statement);
      }
    }
    
    console.log('✅ Migration executed successfully');
  } catch (error) {
    console.error('❌ Error running migration:', error);
    throw error;
  }
}

/**
 * Initializes the database by running migrations
 * This should be called once when the app starts
 */
export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  try {
    
    // Read migration file
    const migrationSQL = `
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        height_meters REAL,
        height_feet REAL,
        height_inches REAL,
        weight_kilos REAL,
        weight_pounds REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_user_profile_created_at ON user_profile (created_at);
      CREATE INDEX IF NOT EXISTS idx_user_profile_updated_at ON user_profile (updated_at);

      CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        target_steps INTEGER,
        target_calories INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_user_preferences_created_at ON user_preferences (created_at);
      CREATE INDEX IF NOT EXISTS idx_user_preferences_updated_at ON user_preferences (updated_at);
    `;
    
    await runMigration(migrationSQL);
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

/**
 * Executes a query and returns the results
 * @param query SQL query string
 * @param params Query parameters
 * @returns Promise<any[]> Query results
 */
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync<T>(query, params);
    return result;
  } catch (error) {
    console.error('❌ Error executing query:', error);
    throw error;
  }
}

/**
 * Executes an insert, update, or delete statement
 * @param query SQL statement
 * @param params Query parameters
 * @returns Promise<SQLite.SQLiteRunResult> Execution result
 */
export async function executeStatement(
  query: string,
  params: any[] = []
): Promise<SQLite.SQLiteRunResult> {
  try {
    const database = await getDatabase();
    const result = await database.runAsync(query, params);
    return result;
  } catch (error) {
    console.error('❌ Error executing statement:', error);
    throw error;
  }
}

/**
 * Executes multiple statements in a transaction
 * @param statements Array of { query: string, params: any[] }
 * @returns Promise<void>
 */
export async function executeTransaction(
  statements: Array<{ query: string; params?: any[] }>
): Promise<void> {
  try {
    const database = await getDatabase();
    await database.withTransactionAsync(async () => {
      for (const { query, params = [] } of statements) {
        await database.runAsync(query, params);
      }
    });
    console.log('✅ Transaction completed successfully');
  } catch (error) {
    console.error('❌ Error executing transaction:', error);
    throw error;
  }
}

export async function migrateDbIfNeeded(db: SQLite.SQLiteDatabase) {
    if (!db)
        throw Error("Failed to initialize database");

    console.log("Initializing migration");
    const DATABASE_VERSION = 1;
    let { user_version: currentDbVersion } = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
    );
    if (currentDbVersion === null)
        throw Error("Failed to get current db version");
    if (currentDbVersion >= DATABASE_VERSION) {
        return;
    }
    if (currentDbVersion === 0) {
        console.log("Initializing Data base");
        await initializeDatabase(db);
        currentDbVersion = 1;
    }
    // if (currentDbVersion === 1) {
    //   Add more migrations
    // }
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}