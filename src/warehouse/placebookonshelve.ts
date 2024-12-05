import Router from 'koa-router';
import { ObjectId } from 'mongodb';
import { warehouse_shelf } from "../db";  // Import your MongoDB connection
import { z } from 'zod';  // Import Zod for validation
import { Context } from 'koa';  // Import Context type for Koa

// Define Zod schema for validation of the book and shelf data
const placeBooksOnShelfSchema = z.object({
  bookId: z.string().min(1, 'Book ID cannot be empty'),  // bookId should be a non-empty string
  shelfId: z.string().min(1, 'Shelf ID cannot be empty'),  // shelfId should be a non-empty string
  numberOfBooks: z.number().int().positive('Number of books must be positive')  // Ensure it's a positive integer
});

const router = new Router();

// PUT endpoint to place books on a shelf
router.put('/warehouse/:bookId/:shelfId/:numberOfBooks', async (ctx: Context) => {
  try {
    // Validate the request parameters with Zod
    const parsed = placeBooksOnShelfSchema.parse({
      bookId: ctx.params.bookId, 
      shelfId: ctx.params.shelfId, 
      numberOfBooks: parseInt(ctx.params.numberOfBooks, 10) 
    });

    const { bookId, shelfId, numberOfBooks } = parsed;

    // Convert bookId to ObjectId if you're using MongoDB's ObjectId
    const bookObjectId = new ObjectId(bookId);

    // Check if the warehouse shelf already exists for this book and shelf combination
    const shelf = await warehouse_shelf.findOne({ bookId: bookObjectId, shelfId });

    if (shelf) {
      // If shelf exists, update the number of books on the shelf
      await warehouse_shelf.updateOne(
        { bookId: bookObjectId, shelfId },
        { $inc: { numberOfBooks: numberOfBooks } }  // Increment the number of books on the existing shelf
      );
    } else {
      // If shelf doesn't exist, create a new entry for the shelf
      await warehouse_shelf.insertOne({
        bookId: bookObjectId,
        shelfId,
        numberOfBooks
      });
    }

    // Respond with a success message
    ctx.status = 200;
    ctx.body = {
      message: `Placed ${numberOfBooks} books on shelf ${shelfId}`
    };
  } catch (err) {
    // Handle validation errors
    if (err instanceof z.ZodError) {
      ctx.status = 400;
      ctx.body = { error: err.errors };
      return;
    }

    // Handle other errors (e.g., database connection issues)
    ctx.status = 500;
    ctx.body = { error: 'Internal Server Error' };
  }
});

// Define Zod schema for validation of the bookId parameter
const findBookOnShelfSchema = z.object({
  bookId: z.string().refine(val => ObjectId.isValid(val), {
    message: 'Invalid bookId format', // Check if the bookId is a valid ObjectId string
  }),
});

// GET endpoint to find books on shelves
router.get('/warehouse/:bookId', async (ctx: Context) => {
  try {
    // Validate the bookId parameter using Zod
    const parsed = findBookOnShelfSchema.parse({
      bookId: ctx.params.bookId,
    });

    const { bookId } = parsed;

    // Convert bookId to MongoDB ObjectId for query
    const bookObjectId = new ObjectId(bookId);

    // Query MongoDB to find all shelf entries for the given bookId
    const shelves = await warehouse_shelf.find({ bookId: bookObjectId }).toArray();

    // If no shelves are found, return an empty array
    if (shelves.length === 0) {
      ctx.status = 404;
      ctx.body = { message: 'Book not found on any shelf' };
      return;
    }

    // Prepare the result in the required format [{ shelf, count }]
    const result = shelves.map(shelf => ({
      shelf: String(shelf.shelfId),    // shelfId should be the shelf identifier (string)
      count: Number(shelf.numberOfBooks),  // number of books on that shelf
    }));

    // Respond with the result
    ctx.status = 200;
    ctx.body = result;
  } catch (err) {
    // Handle validation errors
    if (err instanceof z.ZodError) {
      ctx.status = 400;
      ctx.body = { error: err.errors };
      return;
    }

    // Handle other errors, such as MongoDB errors
    ctx.status = 500;
    ctx.body = { error: 'Internal Server Error' };
  }
});

export default router;
