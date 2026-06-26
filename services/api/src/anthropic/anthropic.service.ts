import Anthropic from '@anthropic-ai/sdk';
import {ParsedInvoice} from "./types";


const SYSTEM_PROMPT = `You are an invoice parsing engine. You are given a single PDF invoice.
Extract the following and return ONLY valid JSON (no prose, no markdown):
- sourceCurrency: the ISO 4217 code of the currency the invoice is denominated in
  (e.g. "USD", "EUR", "GBP"). Infer it ONLY from explicit cues on the invoice:
  currency codes, symbols, or unambiguous country/locale information.
  If the currency cannot be determined with confidence, return null. Do NOT guess.
- lineItems: an array of objects, one per billable line on the invoice, each with:
    - description: the line item's text description, trimmed
    - amount: the line item's total price as a number in the source currency
      (no currency symbol, no thousands separators, use a dot decimal separator. Convert comma decimals to dot decimals, e.g., "46,00" becomes 46.00).
- total: the invoice grand total as a number in the source currency.

Rules:
- Use the invoice's line totals, not unit prices, for each lineItem.amount.
- Do NOT convert currencies. Report every amount in the source currency only.
- Do NOT include tax/subtotal/shipping rows as line items unless they are themselves
  billable line items; capture tax/shipping in the grand total via "total".
- IMPORTANT FALLBACK: If the explicitly stated grand total or subtotal on the document is missing, empty, or "0.00" (but valid line items exist), calculate the total yourself by summing all the extracted line item amounts. Do not return 0 if there are billable items.
- Numbers must be JSON numbers, not strings.`


const INVOICE_SCHEMA: Anthropic.Tool.InputSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['sourceCurrency', 'lineItems', 'total'],
    properties: {
        sourceCurrency: {type: ['string', 'null']},
        lineItems: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['description', 'amount'],
                properties: {
                    description: {type: 'string'},
                    amount: {type: 'number'},
                },
            },
        },
        total: {type: 'number'},
    },
};

class AnthropicService {
    private readonly client: Anthropic;

    constructor() {
        this.client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
    }

    async parseInvoice(pdfFile: Buffer): Promise<ParsedInvoice> {
        const base64File = pdfFile.toString('base64');

        const response = await this.client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            tools: [
                {
                    name: 'invoice_extraction',
                    description: 'Return the extracted invoice data.',
                    input_schema: INVOICE_SCHEMA,
                },
            ],
            tool_choice: {type: 'tool', name: 'invoice_extraction'},
            messages: [
                {
                    role: 'user',
                    content: [
                        {type: 'text', text: 'Extract this invoice.'},
                        {
                            type: 'document',
                            source: {
                                type: 'base64',
                                media_type: 'application/pdf',
                                data: base64File,
                            },
                        },
                    ],
                },
            ],
        });

        const toolUse = response.content.find(
            (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
        );

        if (!toolUse) {
            throw new Error('Anthropic did not return structured invoice data.');
        }

        return toolUse.input as ParsedInvoice;
    }
}

export default new AnthropicService();