import Router from 'koa-router'
import { ObjectId } from 'mongodb'
import {  warehouse_collection } from '../src/db'  // Replace with the actual collection you're using
import { Context } from 'koa'
import { z } from 'zod'

const router = new Router({
    prefix: '/order',
})

// Place an order
router.post('/', async (ctx: Context) => {
    try {
        // Validate request body
        const bodySchema = z.object({
            order: z.array(z.string().length(24, 'bookId must be 24 characters long')) // Validate that order is an array of ObjectIds (strings)
        })

        const parsedBody = bodySchema.parse(ctx.request.body)
        const { order } = parsedBody

        // Convert book IDs to ObjectId format
        const bookObjectIds = order.map(bookId => new ObjectId(bookId))

        // Create a new order document in the warehouse collection
        const newOrder = {
            books: bookObjectIds,  // Store the book IDs in the order
            status: 'pending',      // Set initial order status as 'pending'
            createdAt: new Date(),  // Store the creation date
        }

        // Log the full newOrder object before inserting (for debugging)
        console.log('Inserting Order into Warehouse:', newOrder)

        // Insert into the warehouse collection
        const result = await warehouse_collection.insertOne(newOrder)

        if (result.acknowledged) {
            // Return the order ID of the created order
            ctx.status = 201
            ctx.body = { orderId: result.insertedId.toHexString() }
        } else {
            ctx.status = 500
            ctx.body = { message: 'Failed to create order' }
        }
    } catch (error) {
        console.error('POST request error:', error)

        if (error instanceof z.ZodError) {
            ctx.status = 400
            ctx.body = { message: 'Validation Error', errors: error.errors }
        } else {
            ctx.status = 500
            ctx.body = { message: 'Internal server error', error: error.message }
        }
    }
})
router.get('/', async (ctx: Context) => {
    try {
        // Fetch all orders from the database
        const orders = await warehouse_collection.find({}).toArray()

        // Map the results to match the expected response format
        const formattedOrders = orders.map(order => {
            // Ensure the books field exists and is an array
            if (!Array.isArray(order.books)) {
                // If the books field is not an array or is missing, return an empty object
                return {
                    orderId: order._id.toHexString(),
                    books: {},
                }
            }

            // If books is an array, process it to count occurrences of each bookId
            const books = order.books.reduce((acc: Record<string, number>, bookId: ObjectId) => {
                const bookStringId = bookId.toHexString()
                acc[bookStringId] = (acc[bookStringId] || 0) + 1
                return acc
            }, {})

            return {
                orderId: order._id.toHexString(),
                books,
            }
        })

        ctx.status = 200
        ctx.body = formattedOrders
    } catch (error) {
        console.error('GET request error:', error)
        ctx.status = 500
        ctx.body = { message: 'Internal server error', error: error.message }
    }
})


export default router
