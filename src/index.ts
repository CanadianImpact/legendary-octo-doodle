import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import koaQs from 'koa-qs';
import router from './routes';
import cors from '@koa/cors';

const app = new Koa();

// Enhance query string parsing
koaQs(app);

// Middleware to parse request bodies
app.use(bodyParser());
app.use(cors());

// Routes
app.use(router.routes());
app.use(router.allowedMethods());

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
