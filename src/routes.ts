import Router from 'koa-router';
import { Context } from 'koa';
import { promises as fs } from 'fs';
import { bookSchema, Book } from './book.schema';
import * as path from 'path';

const router = new Router();
const booksFilePath = path.join(__dirname, '../mcmasteful-book-list.json');

// Helper function to read books from the JSON file
async function readBooksFromFile(): Promise<Book[]> {
    const data = await fs.readFile(booksFilePath, 'utf-8');
    return JSON.parse(data);
}

// Helper function to write books to the JSON file
async function writeBooksToFile(books: Book[]): Promise<void> {
    await fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), 'utf-8');
}

// Get all books
router.get('/books', async (ctx: Context) => {
    const books = await readBooksFromFile();
    ctx.body = books;
});

// Add a new book
router.post('/books', async (ctx: Context) => {
    try {
        const parsedBody = await bookSchema.parseAsync(ctx.request.body);
        const books = await readBooksFromFile();
        books.push(parsedBody);
        await writeBooksToFile(books);
        ctx.body = parsedBody;
        ctx.status = 201; // Created
    } catch (error) {
        ctx.status = 400;
        ctx.body = error.errors; // Validation errors
    }
});

// Get a book by title
router.get('/books/:title', async (ctx: Context) => {
    const { name } = ctx.params;
    const books = await readBooksFromFile();
    const book = books.find((b) => b.name === name);

    if (book) {
        ctx.body = book;
    } else {
        ctx.status = 404;
        ctx.body = { error: "Book not found" };
    }
});

// Delete a book by title
router.delete('/books/:title', async (ctx: Context) => {
    const { name } = ctx.params;
    let books = await readBooksFromFile();
    const initialLength = books.length;
    books = books.filter((b) => b.name !== name);

    if (books.length === initialLength) {
        ctx.status = 404;
        ctx.body = { error: "Book not found" };
    } else {
        await writeBooksToFile(books);
        ctx.status = 204; // No content
    }
});

export default router;
