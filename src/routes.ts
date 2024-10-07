// src/routes/books.ts
import Router from 'koa-router';
import { ObjectId } from 'mongodb';
import { getDB } from '../src/db';
import { Context } from 'koa';
import { bookSchema, BookSchema } from '../src/book.schema';
import { z } from 'zod';

const router = new Router({
    prefix: '/books',
});

// Get all books
router.get('/', async (ctx: Context) => {
    const db = getDB();
    const books = await db.collection<BookSchema>('books').find().toArray();

    // Convert ObjectId to string for each book
    const formattedBooks = books.map((book) => ({
        ...book,
        _id: book._id.toString(),  // Ensure _id is returned as a string
    }));

    ctx.body = formattedBooks;
});

// Get a book by id
router.get('/:id', async (ctx: Context) => {
    const db = getDB();
    const bookId = ctx.params.id;

    // Fetch the book by string _id
    const book = await db.collection<BookSchema>('books').findOne({ _id: new ObjectId(bookId) });

    if (!book) {
        ctx.status = 404;
        ctx.body = { message: 'Book not found' };
        return;
    }

    // Ensure the _id is returned as a string
    ctx.body = { ...book, _id: book._id.toString() };
});

// Add a new book
router.post('/', async (ctx: Context) => {
    try {
        // Validate request body
        const parsedBook = bookSchema.parse(ctx.request.body);

        const db = getDB();

        // Assign _id using MongoDB's default ObjectId
        const bookWithObjectId = {
            ...parsedBook,
            _id: new ObjectId(),  // MongoDB will generate an ObjectId
        };

        const result = await db.collection<BookSchema>('books').insertOne(bookWithObjectId);

        ctx.body = { message: 'Book added', id: bookWithObjectId._id.toString() }; // Return _id as string
        ctx.status = 201;
    } catch (error) {
        if (error instanceof z.ZodError) {
            ctx.status = 400;
            ctx.body = { message: 'Validation Error', errors: error.errors };
        } else {
            ctx.status = 500;
            ctx.body = { message: 'Internal server error' };
        }
    }
});

// Update a book
router.put('/:id', async (ctx: Context) => {
    try {
        const bookId = ctx.params.id;

        // Validate the request body for the updated book data
        const parsedBook = bookSchema.partial().parse(ctx.request.body);  // partial() allows partial updates

        const db = getDB();
        const result = await db.collection<BookSchema>('books').updateOne(
            { _id: new ObjectId(bookId) },  // Use ObjectId for matching
            { $set: parsedBook },
        );

        if (result.matchedCount === 0) {
            ctx.status = 404;
            ctx.body = { message: 'Book not found' };
        } else {
            ctx.body = { message: 'Book updated' };
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            ctx.status = 400;
            ctx.body = { message: 'Validation Error', errors: error.errors };
        } else {
            ctx.status = 500;
            ctx.body = { message: 'Internal server error' };
        }
    }
});

// Delete a book
router.delete('/:id', async (ctx: Context) => {
    const db = getDB();
    const bookId = ctx.params.id;

    const result = await db.collection<BookSchema>('books').deleteOne({ _id: new ObjectId(bookId) });

    if (result.deletedCount === 0) {
        ctx.status = 404;
        ctx.body = { message: 'Book not found' };
    } else {
        ctx.body = { message: 'Book deleted' };
    }
});

export default router;
