import CurrencyConverter from "../currency-converter/currency-converter";
import {Currency} from "../currency-converter/types";
import {BadRequestException} from "../error";
import AnthropicService from "../anthropic/anthropic.service";
import {CurrencyAmounts, ExchangeRatesInfo, ExtractedInvoice, LineItem} from "./types";


type ParsedInvoice = {
    sourceCurrency: string;
    lineItems: { description: string; amount: number }[];
    total: number;
};

class InvoiceParserService {
    async parse(fileBuffer?: Buffer): Promise<ExtractedInvoice> {
        if (!fileBuffer) {
            throw new BadRequestException('The file is missing');
        }

        this.validateFile(fileBuffer);

        const parsedInvoice = await AnthropicService.parseInvoice(fileBuffer)

        if (parsedInvoice.sourceCurrency === null) {
            throw new BadRequestException('The invoice currency could not be determined');
        }


        if (!CurrencyConverter.getSupportedCurrencies().has(parsedInvoice.sourceCurrency)) {
            throw new BadRequestException(`Currency ${parsedInvoice.sourceCurrency} is not supported`)
        }

        if (parsedInvoice.lineItems.length === 0) {
            throw new BadRequestException(`The current invoice has no line items`)
        }

        return await this.createExtractedInvoiceInformation({
            ...parsedInvoice,
            sourceCurrency: parsedInvoice.sourceCurrency,
        });
    }

    private async createExtractedInvoiceInformation(parsedInvoice: ParsedInvoice): Promise<ExtractedInvoice> {
        const sourceCurrency = parsedInvoice.sourceCurrency as Currency;


        const rates = await this.getExchangeRates(sourceCurrency);

        const lineItems: LineItem[] = parsedInvoice.lineItems.map(lineItem => ({
            description: lineItem.description,
            price: this.toCurrencyAmounts(lineItem.amount, sourceCurrency, rates),
        }));

        const exchangeRates: ExchangeRatesInfo = {
            asOf: new Date().toISOString().slice(0, 10),
            provider: CurrencyConverter.getProvider(),
            live: true,
        };

        return {
            sourceCurrency,
            lineItems,
            total: this.toCurrencyAmounts(parsedInvoice.total, sourceCurrency, rates),
            exchangeRates,
        };
    }


    private async getExchangeRates(sourceCurrency: Currency): Promise<Map<Currency, number>> {
        const allCurrencies = [Currency.USD, Currency.EUR, Currency.GBP];
        const targetCurrencies = allCurrencies.filter(currency => currency !== sourceCurrency);

        return await CurrencyConverter.fetchRatesForCurrencies(sourceCurrency, targetCurrencies);
    }

    private toCurrencyAmounts(amount: number, sourceCurrency: Currency, rates: Map<Currency, number>): CurrencyAmounts {
        const round = (value: number) => Math.round(value * 100) / 100;

        return [Currency.USD, Currency.EUR, Currency.GBP].reduce((amounts, currency) => {
            if (currency === sourceCurrency) {
                amounts[currency] = round(amount);
            } else {
                amounts[currency] = round(CurrencyConverter.convert(amount, rates.get(currency)!));
            }
            return amounts;
        }, {} as CurrencyAmounts);
    }

    private validateFile(fileBuffer: Buffer) {
        const magicNumber = fileBuffer.subarray(0, 4).toString('hex').toUpperCase();

        // Check if it matches the '25504446' (%PDF) signature
        if (magicNumber !== '25504446') {
            throw new BadRequestException('Invalid file format. The file is not a genuine PDF.');
        }
    }
}

export default new InvoiceParserService();

