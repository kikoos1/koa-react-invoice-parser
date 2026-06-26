import Koa from 'koa'
import cors from '@koa/cors'
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
app.use(router.routes())
app.use(router.allowedMethods());


const server = app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server is running on port ${process.env.PORT ?? 3000}`)
})

process.on("uncaughtException", (err) => {
    console.error(err);
    process.exit(1);
})

process.on("unhandledRejection", (err) => {
    console.error(err);
    process.exit(1);
})


let shuttingDown = false;

async function closeGracefully(signal: string) {
    if (shuttingDown) return;   // ignore repeated signals
    shuttingDown = true;
    console.log(`Received ${signal}, shutting down gracefully...`);

    // Force-exit if cleanup takes too long
    const forceTimeout = setTimeout(() => {
        console.error("Could not close in time, forcing exit");
        process.exit(1);
    }, 10_000);
    forceTimeout.unref();   // don't keep the event loop alive just for this

    try {
        // 1. Stop accepting new connections, wait for in-flight ones
        await new Promise<void>((resolve, reject) => {
            server.close((err) => (err ? reject(err) : resolve()));
        });

        // 2. Close other resources here (DB, queues, etc.)
        // await prisma.$disconnect();

        clearTimeout(forceTimeout);
        console.log("Shutdown complete");
        process.exit(0);
    } catch (err) {
        console.error("Error during shutdown", err);
        process.exit(1);
    }
}

process.on("SIGTERM", () => closeGracefully("SIGTERM"));
process.on("SIGINT", () => closeGracefully("SIGINT"));