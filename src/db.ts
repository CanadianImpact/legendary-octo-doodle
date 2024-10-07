// src/db.ts
import { MongoClient, Db } from 'mongodb';

const mongoURI = process.env.MONGO_URI || 'mongodb://mongo/';
const dbName = 'mcmastefulBookDB';

let db: Db | null = null;

export const connectDB = async (): Promise<void> => {
    try {
        const client = new MongoClient(mongoURI);
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db(dbName);
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
};

export const getDB = (): Db => {
    if (!db) {
        throw new Error('Database not connected');
    }
    return db;
};
