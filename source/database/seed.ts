import Database from './Database';

export type WordSeeder = {
  word: string;
  length: number;
  num_words: number;
};

export type CategorySeeder = Record<string, WordSeeder[]>[];

export type CrosswordSeedData = Record<string, CategorySeeder>;

export async function insertData(jsonData: CrosswordSeedData) {
  for (const [categoryName, articles] of Object.entries(jsonData)) {
    // Insert the category and get the generated ID
    const categoryResult = await Database.executeSql(
      `INSERT INTO Categories (name) VALUES (?)`,
      [categoryName],
    );
    const categoryId = categoryResult.insertId;
    for (const article of articles) {
      for (const [articleName, wordsArray] of Object.entries(article)) {
        for (const wordObj of wordsArray) {
          // Insert the word and get the generated ID
          const wordResult = await Database.executeSql(
            `INSERT INTO Words (word, length, numWords, categoryId) VALUES (?, ?, ?, ?)`,
            [wordObj.word, wordObj.length, wordObj.num_words, categoryId],
          );

          const wordId = wordResult.insertId;
          await Database.executeSql(
            `INSERT INTO Descriptors (description, wordId) VALUES (?, ?)`,
            [articleName, wordId],
          );
        }
      }
    }
  }
}
