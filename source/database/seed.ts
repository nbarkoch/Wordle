import Database from './Database';

export type WordSeeder = {
  word: string;
  length: number;
  num_words: number;
};

export type CategorySeeder = Record<string, WordSeeder[]>[];

export type CrosswordSeedData = Record<string, CategorySeeder>;

// SQLite typically has a limit of 999 variables per statement
const SQLITE_VARIABLE_LIMIT = 999;
const WORD_FIELDS = 4; // word, length, numWords, categoryId
const WORDS_PER_BATCH = Math.floor(SQLITE_VARIABLE_LIMIT / WORD_FIELDS);

export async function insertData(jsonData: CrosswordSeedData) {
  const db = await Database.getInstance();

  return new Promise<void>((resolve, reject) => {
    db.transaction(
      tx => {
        const insertCategory = (
          categoryName: string,
          callback: (id: number) => void,
        ) => {
          tx.executeSql(
            'INSERT INTO Categories (name) VALUES (?)',
            [categoryName],
            (_, result) => callback(result.insertId),
            (_, error) => {
              console.error('Error inserting category:', error);
              return false;
            },
          );
        };

        const batchInsertWords = (
          wordValues: string[],
          params: any[],
          callback: (id: number) => void,
        ) => {
          const sql = `INSERT INTO Words (word, length, numWords, categoryId) VALUES ${wordValues.join(
            ', ',
          )}`;
          tx.executeSql(
            sql,
            params,
            (_, result) => callback(result.insertId),
            (_, error) => {
              console.error('Error inserting words:', error);
              return false;
            },
          );
        };

        const batchInsertDescriptors = (
          descriptorValues: string[],
          params: any[],
          callback: () => void,
        ) => {
          const sql = `INSERT INTO Descriptors (description, wordId) VALUES ${descriptorValues.join(
            ', ',
          )}`;
          tx.executeSql(
            sql,
            params,
            () => callback(),
            (_, error) => {
              console.error('Error inserting descriptors:', error);
              return false;
            },
          );
        };

        const processWordBatch = (
          words: [string, number, number, number][],
          descriptors: [string, number][],
          startIndex: number,
          callback: () => void,
        ) => {
          const batchSize = Math.min(
            WORDS_PER_BATCH,
            words.length - startIndex,
          );
          const wordBatch = words.slice(startIndex, startIndex + batchSize);
          const descriptorBatch = descriptors.slice(
            startIndex,
            startIndex + batchSize,
          );

          const wordValues = wordBatch.map(() => '(?, ?, ?, ?)');
          const wordParams = wordBatch.flat();

          batchInsertWords(wordValues, wordParams, firstWordId => {
            const descriptorValues = descriptorBatch.map(() => '(?, ?)');
            const descriptorParams = descriptorBatch.flatMap(
              ([description], index) => [description, firstWordId + index],
            );

            batchInsertDescriptors(descriptorValues, descriptorParams, () => {
              if (startIndex + batchSize < words.length) {
                processWordBatch(
                  words,
                  descriptors,
                  startIndex + batchSize,
                  callback,
                );
              } else {
                callback();
              }
            });
          });
        };

        const processCategory = (
          categoryEntries: [string, CategorySeeder][],
          index: number,
        ) => {
          if (index >= categoryEntries.length) {
            resolve();
            return;
          }

          const [categoryName, articles] = categoryEntries[index];
          insertCategory(categoryName, categoryId => {
            const words: [string, number, number, number][] = [];
            const descriptors: [string, number][] = [];

            for (const article of articles) {
              for (const [articleName, wordsArray] of Object.entries(article)) {
                for (const wordObj of wordsArray) {
                  words.push([
                    wordObj.word,
                    wordObj.length,
                    wordObj.num_words,
                    categoryId,
                  ]);
                  descriptors.push([articleName, 0]); // Placeholder for wordId
                }
              }
            }

            if (words.length > 0) {
              processWordBatch(words, descriptors, 0, () => {
                processCategory(categoryEntries, index + 1);
              });
            } else {
              processCategory(categoryEntries, index + 1);
            }
          });
        };

        processCategory(Object.entries(jsonData), 0);
      },
      error => {
        console.error('Transaction error:', error);
        reject(error);
      },
      () => {
        console.log('Transaction completed successfully');
      },
    );
  });
}
