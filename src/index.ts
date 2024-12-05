// src/server.ts
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import booksRoutes from '../src/routes'
import orderroute from './orderroute'
import shelveroutes from './warehouse/placebookonshelve'
import fulfillorder from "./fulfillorder"

const app = new Koa()

// Middleware
app.use(
  cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
)
app.use(bodyParser())

// Load routes
app.use(orderroute.routes()).use(orderroute.allowedMethods())
app.use(booksRoutes.routes()).use(booksRoutes.allowedMethods())
app.use(shelveroutes.routes()).use(shelveroutes.allowedMethods())
app.use(fulfillorder.routes()).use(fulfillorder.allowedMethods());

app.listen(3000, () => {
  console.log('listening')
})
