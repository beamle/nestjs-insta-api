import { Connection } from 'mongoose';

export async function deleteAllData(connection: Connection): Promise<void> {
  await Promise.all(
    Object.values(connection.collections).map(async (collection) => {
      await collection.deleteMany({});
    }),
  );
}
