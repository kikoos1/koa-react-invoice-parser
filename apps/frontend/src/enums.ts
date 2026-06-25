const Currency = {
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP',
} as const;

type Currency = (typeof Currency)[keyof typeof Currency];

export { Currency };

