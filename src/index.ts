// src/server.ts
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import booksRoutes from '../src/routes';
import { connectDB } from './db';

const app = new Koa();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser());

// Load routes
app.use(booksRoutes.routes());
app.use(booksRoutes.allowedMethods());

// Start server and connect to MongoDB
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error('Failed to start server:', err);
});
