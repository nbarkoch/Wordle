import {initializeDatabase} from '../database/define';
import {CrosswordSeedData, insertData, WordSeeder} from '../database/seed';
import mockData from '../database/mockData.json'; // TypeScript will understand this as a module
import Database from '../database/Database';

export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const result = await Database.executeSql(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';
      `);
    console.log('result', result);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking table existence:', error);
    return false;
  }
};

export async function initDatabaseAndFillData() {
  //   await dropTables();
  const categoriesTableExists = await tableExists('Categories');
  const wordsTableExists = await tableExists('Words');
  const descriptorsTableExists = await tableExists('Descriptors');
  const hintsTableExists = await tableExists('Hints');

  if (
    !categoriesTableExists ||
    !wordsTableExists ||
    !descriptorsTableExists ||
    !hintsTableExists
  ) {
    console.log('One or more tables do not exist. Creating tables...');
    await initializeDatabase();
    const data = mockData as CrosswordSeedData;
    await insertData(data);
  } else {
    console.log('All tables already exist.');
  }
}

export async function getAllWordsFromCategoryOfLength(
  category: string,
  length: number,
) {
  const categoryResult = await Database.executeSql(
    `
      SELECT * FROM Categories
      WHERE name = ?;
    `,
    [category],
  );

  const categoryId = categoryResult.rows.item(0)?.id;

  const wordResult = await Database.executeSql(
    `
      SELECT * FROM Words
      WHERE categoryId = ? AND length = ?;
    `,
    [categoryId, length],
  );

  const words: WordSeeder[] = [];
  for (let i = 0; i < wordResult.rows.length; i++) {
    words.push(wordResult.rows.item(i));
  }

  return words;
}

export async function getAllWordsWithName(wordName: string) {
  const wordResult = await Database.executeSql(
    `
        SELECT * FROM Words
        WHERE word = ?;
      `,
    [wordName],
  );

  const words: WordSeeder[] = [];
  for (let i = 0; i < wordResult.rows.length; i++) {
    words.push(wordResult.rows.item(i));
  }
  return words;
}
