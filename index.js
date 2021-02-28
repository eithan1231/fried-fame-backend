require('dotenv').config();
const Koa = require('koa');

// middleware
const router = require('./library/router');
const ffrpcMiddleware = require('./library/middleware/ffrpc');

// Creating koa application
const app = new Koa();

// logging request once completed.
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  console.log(`${ctx.request.method} ${end - start}ms ${ctx.response.status} ${ctx.request.url}`);
});

// Setting all of our middleware
app.use(ffrpcMiddleware);
app.use(router.routes());
app.use(router.allowedMethods());

// Starting the HTTP server
app.listen(process.env.FFRPC_PORT);
console.log(`now listening on ${process.env.FFRPC_PORT}`);
