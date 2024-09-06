import Database from './Database';

export const initializeDatabase = async () => {
  try {
    const db = await Database.getInstance();
    await db.transaction(async tx => {
      await tx.executeSql('PRAGMA foreign_keys = ON;');

      await tx.executeSql(`
      CREATE TABLE IF NOT EXISTS Categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        name TEXT NOT NULL
      );
    `);

      await tx.executeSql(`
      CREATE TABLE IF NOT EXISTS Words (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        word TEXT NOT NULL,
        length INTEGER NOT NULL,
        numWords INTEGER NOT NULL,
        categoryId INTEGER NOT NULL,
        FOREIGN KEY (categoryId) REFERENCES Categories(id)
      );
    `);

      await tx.executeSql(`
      CREATE TABLE IF NOT EXISTS Descriptors (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        description TEXT NOT NULL,
        wordId INTEGER NOT NULL,
        FOREIGN KEY (wordId) REFERENCES Words(id)
      );
    `);

      await tx.executeSql(`
      CREATE TABLE IF NOT EXISTS Hints (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        hint TEXT NOT NULL,
        wordId INTEGER NOT NULL,
        FOREIGN KEY (wordId) REFERENCES Words(id)
      );
    `);
    });

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error initializing database', error);
  }
};
