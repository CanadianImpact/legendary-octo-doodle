import Router from 'koa-router';
import { z } from 'zod';

type BookID = string;
type ShelfId = string;
type OrderId = string;

interface BookFulfilled {
  book: BookID;
  shelf: ShelfId;
  numberOfBooks: number;
}

const BookSchema = z.object({
  book: z.string().min(1),       // BookID should be a non-empty string
  shelf: z.string().min(1),      // ShelfId should be a non-empty string
  numberOfBooks: z.number().int().positive(),  // numberOfBooks should be a positive integer
});

const FulfilOrderSchema = z.array(BookSchema);  // An array of Book objects

async function fulfilOrder(
  order: string,
  booksFulfilled: Array<{ book: string; shelf: string; numberOfBooks: number }>
): Promise<void> {
  const result = await fetch(`http://localhost:3000/fulfil/${order}`, {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booksFulfilled),
  });

  if (!result.ok) {
    throw new Error(`Couldn't Fulfil: ${await result.text()}`);
  }
}

const router = new Router();

// Define the route
router.put('/fulfil/:orderId', async (ctx) => {
  const { orderId } = ctx.params;  // Get the orderId from URL parameter
  const booksFulfilled: BookFulfilled[] = ctx.request.body;  // Get the body of the request

  // Validate the body using Zod schema
  try {
    FulfilOrderSchema.parse(booksFulfilled);  // If invalid, this will throw an error
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid request data', details: error.errors };
    return;
  }

  // Now call the fulfilOrder adapter function
  try {
    await fulfilOrder(orderId, booksFulfilled);  // Use the adapter to fulfill the order
    ctx.status = 200;
    ctx.body = { message: 'Order fulfilled successfully' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});


export default router
