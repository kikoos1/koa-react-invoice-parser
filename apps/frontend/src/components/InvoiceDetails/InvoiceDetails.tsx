import './InvoiceDetails.css';
import { Currency } from '../../enums';


 type ExtractedInvoice = {
    sourceCurrency: string;
    lineItems: LineItem[];
    total: CurrencyAmounts;
    exchangeRates: ExchangeRates;
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
  
   type ExchangeRates = {
    asOf: string; // Formatted as 'YYYY-MM-DD'
    provider: string;
    live: boolean;
  };

  const COLUMN_ORDER: Currency[] = [Currency.USD, Currency.EUR, Currency.GBP];

  const CURRENCY_LOCALES: Record<Currency, string> = {
    [Currency.USD]: 'en-US',
    [Currency.EUR]: 'de-DE',
    [Currency.GBP]: 'en-GB',
  };

  function formatAmount(currency: Currency, amount: number): string {
    return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
      style: 'currency',
      currency,
    }).format(amount);
  }

  function formatAsOf(asOf: string): string {
    const date = new Date(`${asOf}T00:00:00`);
    if (Number.isNaN(date.getTime())) return asOf;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  export default function InvoiceDetails(props: { invoice: ExtractedInvoice }) {
    const { sourceCurrency, lineItems, total, exchangeRates } = props.invoice;

    return (
      <section className="invoice-details">
        <div className="invoice-details__header">
          <h2 className="invoice-details__title">Parsed invoice</h2>
          <span className="invoice-details__badge invoice-details__badge--currency">
            Invoice currency: {sourceCurrency}
          </span>
          <span className="invoice-details__badge invoice-details__badge--rates">
            <span
              className={`invoice-details__dot${
                exchangeRates.live ? ' invoice-details__dot--live' : ''
              }`}
            />
            {exchangeRates.live ? 'Live exchange rates' : 'Exchange rates'}
            {' \u00b7 '}
            {exchangeRates.provider}
            {' \u00b7 '}
            {formatAsOf(exchangeRates.asOf)}
          </span>
        </div>

        <p className="invoice-details__subtitle">
          Converted amounts use {exchangeRates.live ? 'live ' : ''}rates from{' '}
          {exchangeRates.provider}. The highlighted column is the amount from the
          invoice.
        </p>

        <table className="invoice-details__table">
          <thead>
            <tr>
              <th className="invoice-details__cell invoice-details__cell--label">
                Description
              </th>
              {COLUMN_ORDER.map((currency) => (
                <th
                  key={currency}
                  className={`invoice-details__cell invoice-details__cell--amount${
                    currency === sourceCurrency
                      ? ' invoice-details__cell--source'
                      : ''
                  }`}
                >
                  {currency}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={`${item.description}-${index}`}>
                <td className="invoice-details__cell invoice-details__cell--label">
                  {item.description}
                </td>
                {COLUMN_ORDER.map((currency) => (
                  <td
                    key={currency}
                    className={`invoice-details__cell invoice-details__cell--amount${
                      currency === sourceCurrency
                        ? ' invoice-details__cell--source'
                        : ''
                    }`}
                  >
                    {formatAmount(currency, item.price[currency])}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="invoice-details__row--total">
              <td className="invoice-details__cell invoice-details__cell--label">
                Total
              </td>
              {COLUMN_ORDER.map((currency) => (
                <td
                  key={currency}
                  className={`invoice-details__cell invoice-details__cell--amount${
                    currency === sourceCurrency
                      ? ' invoice-details__cell--source'
                      : ''
                  }`}
                >
                  {formatAmount(currency, total[currency])}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>
    );
  }

