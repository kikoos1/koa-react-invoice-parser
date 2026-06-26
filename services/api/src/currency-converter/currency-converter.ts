import { BadRequestException } from "../error";
import {Currency} from "./types";

type ExchangeRate = {
    date: string;
    base: Currency;
    quote: Currency;
    rate: number;
}


class CurrencyConverter {
    private readonly provider = 'Frankfurter'
    private readonly SUPPORTED_CURRENCIES = new Set<string>([Currency.GBP, Currency.USD, Currency.EUR]);


    async fetchRatesForCurrencies(baseCurrency: Currency, currencies: Currency[]): Promise<Map<Currency, number>> {
        const exchangeRatesMap = new Map<Currency, number>();

        if (currencies.length === 0) {
            return exchangeRatesMap;
        }

        const quotes = currencies.join(',');
        const response = await fetch(`${process.env.FRANKFURTER_API_URL}/rates?base=${baseCurrency}&quotes=${quotes}`);

        if (!response.ok) {
            throw new BadRequestException(`Failed to fetch exchange rates: ${response.statusText}`);
        }

        const exchangeRates = await response.json() as ExchangeRate[];

        for (const exchangeRate of exchangeRates) {
            exchangeRatesMap.set(exchangeRate.quote, exchangeRate.rate);
        }

        return exchangeRatesMap;
    }

    convert(amount: number, rate: number): number {
        return amount * rate;
    }

    getProvider(): string {
        return this.provider
    }

    getSupportedCurrencies(): Set<string> {
        return this.SUPPORTED_CURRENCIES
    }
}


export default new CurrencyConverter();
