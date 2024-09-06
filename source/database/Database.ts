import SQLite from 'react-native-sqlite-storage';

class Database {
  private static instance: SQLite.SQLiteDatabase | null = null;

  static async getInstance(): Promise<SQLite.SQLiteDatabase> {
    if (!Database.instance) {
      Database.instance = await Database.openDatabase();
    }
    return Database.instance;
  }

  private static async openDatabase(): Promise<SQLite.SQLiteDatabase> {
    return new Promise((resolve, reject) => {
      const db = SQLite.openDatabase(
        {
          name: 'crossword.db',
          location: 'default',
        },
        () => {
          console.log('Database opened');
          resolve(db);
        },
        error => {
          console.error('Error opening database', error);
          reject(error);
        },
      );
    });
  }

  static async executeSql(sql: string, params: any[] = []): Promise<any> {
    const db = await Database.getInstance();
    return new Promise((resolve, reject) => {
      db.transaction(txn => {
        txn.executeSql(
          sql,
          params,
          (trans, results) => {
            console.log('SQL execution results:', results);
            resolve(results);
          },
          error => {
            console.error('SQL execution error:', error);
            reject(error);
          },
        );
      });
    });
  }

  static async closeDatabase(): Promise<void> {
    if (Database.instance) {
      await new Promise((resolve, reject) => {
        Database.instance?.close(
          () => {
            console.log('Database closed');
            resolve(null);
          },
          error => {
            console.error('Error closing database', error);
            reject(error);
          },
        );
      });
      Database.instance = null;
    }
  }
}

export default Database;
