import multer from '@koa/multer';
import {BadRequestException} from "../error";

const pdfUploader = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 10, // 10MB
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new BadRequestException('Only PDF files are allowed'), false);
        }


        cb(null, true);
    },
});

export default pdfUploader;