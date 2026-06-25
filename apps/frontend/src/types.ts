import type { Currency } from "./enums";

export type ParsedInvoice = {
    sourceCurrency: string;
    lineItems: LineItem[];
    total: CurrencyAmounts;
    exchangeRates: ExchangeRatesInfo;
};

 type LineItem = {
    description: string;
    price: CurrencyAmounts;
};

 type CurrencyAmounts = {
    [Currency.USD]: number;
    [Currency.EUR]: number;
    [Currency.GBP]: number;
};

type ExchangeRatesInfo = {
    asOf: string; // Formatted as 'YYYY-MM-DD'
    provider: string;
    live: boolean;
};
