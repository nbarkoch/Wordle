import Database from './Database';

export async function dropTables() {
  const db = await Database.getInstance();

  try {
    await db.transaction(async tx => {
      await tx.executeSql(`DROP TABLE IF EXISTS Descriptors`);
      await tx.executeSql(`DROP TABLE IF EXISTS Words`);
      await tx.executeSql(`DROP TABLE IF EXISTS Categories`);
    });
    // console.log('Tables dropped successfully');
  } catch (error) {
    // console.error('Error dropping tables: ', error);
  }
}
