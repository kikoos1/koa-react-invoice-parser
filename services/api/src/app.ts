import Koa from 'koa'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import 'dotenv/config'
import router from "./routes";
import {errorMiddleware} from "./error";

if (!process.env.FRANKFURTER_API_URL) {
    throw new Error('FRANKFURTER_API_URL is not set');
}

if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
}

const app = new Koa();

app.use(errorMiddleware)
app.use(cors())
app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods());


app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server is running on port ${process.env.PORT ?? 3000}`)
})

process.on("uncaughtException", (err) => {
    app.context.closeGracefully();
    console.error(err);
    process.exit(1);
})

process.on("unhandledRejection", (err) => {
    app.context.closeGracefully();
    console.error(err);
    process.exit(1);
})