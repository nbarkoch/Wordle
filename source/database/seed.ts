import Database from './Database';

type WordSeeder = {
  word: string;
  length: number;
  num_words: number;
};

type CategorySeeder = Record<string, WordSeeder[]>;

type CrosswordSeedData = Record<string, CategorySeeder>;

export async function insertData(jsonData: CrosswordSeedData) {
  const db = await Database.getInstance();
  for (const [categoryName, articles] of Object.entries(jsonData)) {
    // Insert the category and get the generated ID
    const [categoryResult] = await db.executeSql(
      `INSERT INTO Categories (name) VALUES (?)`,
      [categoryName],
    );
    const categoryId = categoryResult.insertId;

    for (const [articleName, wordsArray] of Object.entries(articles)) {
      for (const wordObj of wordsArray) {
        // Insert the word and get the generated ID
        const [wordResult] = await db.executeSql(
          `INSERT INTO Words (word, length, numWords, categoryId) VALUES (?, ?, ?, ?)`,
          [wordObj.word, wordObj.length, wordObj.num_words, categoryId],
        );
        const wordId = wordResult.insertId;

        await db.executeSql(
          `INSERT INTO Descriptors (description, wordId) VALUES (?, ?)`,
          [articleName, wordId],
        );
      }
    }
  }
}
