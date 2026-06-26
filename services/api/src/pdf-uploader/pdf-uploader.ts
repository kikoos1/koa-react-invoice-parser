import multer from '@koa/multer';
import {Request} from "koa";
import {BadRequestException} from "../error";

const pdfUploader = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 10, // 10MB
    },
    fileFilter: (_req: Request, file: any, cb: (error: Error | null, success: boolean) => void) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new BadRequestException('Only PDF files are allowed'), false);
        }


        cb(null, true);
    },
});

export default pdfUploader;