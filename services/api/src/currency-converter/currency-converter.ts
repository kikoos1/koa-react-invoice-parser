import {Currency} from "./types";

type ExchangeRateResponse = {
    rate: number;
}


class CurrencyConverter {
    private readonly provider = 'Frankfurter'
    private readonly SUPPORTED_CURRENCIES = new Set<string>([Currency.GBP, Currency.USD, Currency.EUR]);


    private async fetchExchangeRate(baseCurrency: Currency, currency: Currency): Promise<{
        rate: number,
        baseCurrency: Currency,
        targetCurrency: Currency,
    }> {
        const response = await fetch(`${process.env.FRANKFURTER_API_URL}/rate/${baseCurrency}/${currency}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch exchange rate: ${response.statusText}`);
        }

        const data = await response.json() as ExchangeRateResponse;

        return {
            rate: data.rate,
            baseCurrency,
            targetCurrency: currency

        };
    }


    async fetchRatesForCurrencies(baseCurrency: Currency, currencies: Currency[]) {
        const exchangeRateRequests = currencies.map(currency => this.fetchExchangeRate(baseCurrency, currency));

        const exchangeRatesResults = await Promise.all(exchangeRateRequests)

        const exchangeRatesMap = new Map<Currency, number>()

        for (const exchangeRatesResult of exchangeRatesResults) {
            exchangeRatesMap.set(exchangeRatesResult.targetCurrency, exchangeRatesResult.rate)
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



