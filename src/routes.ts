// src/routes/books.ts
import Router from 'koa-router';
import { ObjectId } from 'mongodb';
import { book_collection } from '../src/db';
import { Context } from 'koa';
import { bookSchema, BookSchema } from '../src/book.schema';
import { z } from 'zod';
import { BookID } from '../adapter/assignment-2';



const router = new Router({
    prefix: '/books',
});

// Get all books
router.get('/', async (ctx) => {
    console.log("books_list called on backend");

    // Define the Zod schema for query validation
    const querySchema = z.object({
        filters: z.array(z.object({
            from: z.coerce.number().optional(),
            to: z.coerce.number().optional(),
        })).optional()
    });

    try {
        // Validate the request query
        const { filters } = querySchema.parse(ctx.request.query);

        // Build the MongoDB query based on filters
        const query = filters?.length ? {
            $or: filters.flatMap(({ from, to }) => {
                const filter: { price: { $gte?: number, $lte?: number } } = { price: {} };
                if (from !== undefined) filter.price.$gte = from;
                if (to !== undefined) filter.price.$lte = to;
                return Object.keys(filter.price).length ? [filter] : [];
            })
        } : {};

        // Fetch books from the database based on the constructed query
        const bookList = await book_collection.find(query).map(document => ({
            id: document._id.toHexString(),
            name: document.name,
            image: document.image,
            price: document.price,
            author: document.author,
            description: document.description
        })).toArray();

        // Set the response body to the fetched book list
        ctx.body = bookList;
    } catch (error) {
        ctx.status = 400; // Bad Request if query validation fails
        ctx.body = { message: 'Invalid query parameters', error: error.errors };
    }
});




// Add a new book
router.post('/', async (ctx) => {




    try {
        // Validate the request body
        const body = bookSchema.parse(ctx.request.body);

        if (body.id) {
            // If an ID is provided, try to update the book
            const id = body.id;
            const objectId = new ObjectId(id); // Convert string ID to ObjectId

            // Perform the update operation
            const result = await book_collection.replaceOne(
                { _id: objectId },
                {
                    name: body.name,
                    description: body.description,
                    price: body.price,
                    author: body.author,
                    image: body.image,
                }
            );

            // Check the result of the update operation
            if (result.acknowledged && result.modifiedCount === 1) {
                ctx.body = { id }; // Return the ID of the updated book
            } else {
                ctx.status = 404; // Not Found
                ctx.body = { message: 'Book not found' };
            }
        } else {
            // If no ID is provided, create a new book
            const result = await book_collection.insertOne({
                name: body.name,
                description: body.description,
                price: body.price,
                author: body.author,
                image: body.image,
            });

            // Return the ID of the newly created book
            ctx.body = { id: result.insertedId };
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            ctx.status = 400; // Bad Request
            ctx.body = { message: 'Validation Error', errors: error.errors };
        } else {
            ctx.status = 500; // Internal Server Error
            ctx.body = { message: 'Internal server error' };
        }
    }
});

// Update a book
router.put('/:id', async (ctx: Context) => {
    try {
        const bookId = ctx.params.id;

        // Check if the bookId is a valid MongoDB ObjectId
        if (!ObjectId.isValid(bookId)) {
            ctx.status = 400;
            ctx.body = { message: 'Invalid book ID format' };
            return;
        }

        // Validate and parse the request body
        const parsedBook = bookSchema.partial().parse(ctx.request.body);

        // Remove the _id field if it exists in the request body
        delete parsedBook._id;

        // Perform the update operation
        const result = await book_collection.updateOne(
            { _id: new ObjectId(bookId) }, // Filter by _id
            { $set: parsedBook },          // Update with parsed data, excluding _id
        );

        if (result.matchedCount === 0) {
            ctx.status = 404;
            ctx.body = { message: 'Book not found' };
        } else {
            ctx.body = { message: 'Book updated successfully' };
        }
    } catch (error) {
        console.error('PUT request error:', error);

        if (error instanceof z.ZodError) {
            ctx.status = 400;
            ctx.body = { message: 'Validation Error', errors: error.errors };
        } else {
            ctx.status = 500;
            ctx.body = { message: 'Internal server error', error: error.message };
        }
    }
});

// Delete a book
router.delete('/:id', async (ctx) => {
    // Validate the request parameters using Zod
    const paramsSchema = z.object({
        id: z.string().length(24, 'ID must be 24 characters long'), // Assuming ObjectId
    });

    try {
        const parsedParams = paramsSchema.parse(ctx.params);
        const { id } = parsedParams;

        // Convert the string ID to ObjectId
        const objectId = new ObjectId(id);

        // Attempt to delete the book
        const result = await book_collection.deleteOne({ _id: objectId });

        // Check if the deletion was successful
        if (result.deletedCount === 1) {
            ctx.status = 204; // No Content
            ctx.body = {};
        } else {
            ctx.status = 404; // Not Found
            ctx.body = { message: 'Book not found' };
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            ctx.status = 400; // Bad Request
            ctx.body = { message: 'Validation Error', errors: error.errors };
        } else {
            ctx.status = 500; // Internal Server Error
            ctx.body = { message: 'Internal server error' };
        }
    }


});

export default router;
