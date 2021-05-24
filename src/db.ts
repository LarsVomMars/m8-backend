import { MongoClient } from "mongodb";

const URL = process.env.MONGO_URL || "mongodb://localhost:27017";

export default async function getConnection(): Promise<MongoClient> {
    return await MongoClient.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true });
}

export async function init() {
    const client = await getConnection();
    if (!client) return;
    const db = client.db();
    if (!db) return;
    for (const tbl of tables) {
        try {
            await db.createCollection(tbl);
        } catch (e) {
            if (e.codeName !== "NamespaceExists") console.error(e);
        }
    }
}

export const tables = ["api_keys", "users", "products", "log"];
