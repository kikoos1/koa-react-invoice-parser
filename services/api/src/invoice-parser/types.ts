import {Currency} from "../currency-converter/types";


export type ExtractedInvoice = {
    sourceCurrency: string;
    lineItems: LineItem[];
    total: CurrencyAmounts;
    exchangeRates: ExchangeRatesInfo;
};

export type LineItem = {
    description: string;
    price: CurrencyAmounts;
};

export type CurrencyAmounts = {
    [Currency.USD]: number;
    [Currency.EUR]: number;
    [Currency.GBP]: number;
};

export type ExchangeRatesInfo = {
    asOf: string; // Formatted as 'YYYY-MM-DD'
    provider: string;
    live: boolean;
};
