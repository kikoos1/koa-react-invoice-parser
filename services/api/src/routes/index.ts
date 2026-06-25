import Router from '@koa/router'
import pdfUploader from "../pdfUploader/pdfUploader";
import InvoiceParserController from "../invoice-parser/invoice-parser.controller";

const router = new Router();

router.post('/invoice/parse', pdfUploader.single('file'), InvoiceParserController.parse)


export default router