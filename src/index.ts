// src/server.ts
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import booksRoutes from '../src/routes';


const app = new Koa();


// Middleware
app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(bodyParser());

// Load routes
app.use(booksRoutes.routes()).use(booksRoutes.allowedMethods());

app.listen(3000, () => {
    console.log("listening")
})
