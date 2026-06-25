import {Context, Next} from "koa";
import {MulterError} from "multer";

export class BadRequestException extends Error {
    readonly status: number = 400;

    constructor(message: string) {
        super(message);
    }
}


function handleError(e: unknown, ctx: Context) {
    if (e instanceof BadRequestException) {
        ctx.status = e.status;
        ctx.body = {error: e.message};
        return
    }

    if (e instanceof MulterError) {
        let errorMessage = e.message;

        if (e.code === 'LIMIT_FILE_SIZE') {
            errorMessage = 'File size exceeds the 10MB limit.';
        }
        ctx.status = 400;
        ctx.body = {error: errorMessage};
        return
    }

    if (e instanceof Error) {
        ctx.status = 500;
        ctx.body = {error: e.message || 'An internal error occurred'};
        return
    }

}

export async function errorMiddleware(ctx: Context, next: Next) {
    try {
        await next();
    } catch (e) {
        handleError(e, ctx);
    }
}
