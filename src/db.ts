// src/db.ts
import { MongoClient } from 'mongodb'
import { Book } from '../adapter/assignment-3'
const mongoURI = 'mongodb://mongo'

export const client = new MongoClient(mongoURI)
export const database = client.db('bookstore')
export const book_collection = database.collection<Book>('books')
export const warehouse_collection = database.collection('warehouse_orders')
export const warehouse_shelf = database.collection('Warehouse_shelf')
