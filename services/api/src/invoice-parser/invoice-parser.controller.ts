import InvoiceParserService from "./invoice-parser.service";
import {Context} from "koa";

class InvoiceParserController {

    async parse(ctx: Context): Promise<void> {
        ctx.body = await InvoiceParserService.parse(ctx?.file?.buffer);
    }
}

export default new InvoiceParserController()