export type ParsedInvoice = {
    sourceCurrency: string | null;
    lineItems: LineItem[];
    total: number;
};

type LineItem = {
    description: string;
    amount: number
}