import Database from './Database';

export const tableExists = async (tableName: string): Promise<boolean> => {
  const db = await Database.getInstance();
  return new Promise<boolean>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        ` SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`,
        [],
        (_, result) => {
          //   console.log(
          //     `Table ${tableName} ${
          //       result.rows.length === 0 ? 'Not ' : ''
          //     }exists`,
          //   );
          resolve(result.rows.length > 0);
        },
        (_, error) => {
          console.error('Error checking table existence:', error);
          reject(false);
        },
      );
    });
  });
};
