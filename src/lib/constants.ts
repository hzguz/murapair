export const EXCHANGE_RATES: Record<string, number> = {
    USD: 1,
    BRL: 5.25,
    EUR: 0.92,
    BTC: 1 // Placeholder, logic uses PRICES_IN_USD
};

export const PRICES_IN_USD: Record<string, number> = {
    USD: 1,
    BRL: 0.17, // Updated approx rate
    EUR: 1.09,
    GBP: 1.27,
    BTC: 65000,
};

// "Remova o converter e bitcoin... apenas uma opção de cripto: bitcoin. de resto coloque opções de moedas convencionais"
// "deixe fixado no topo brl e dolar"
export const SUPPORTED_CURRENCIES = [
    'BRL', // Pinned first
    'USD', // Pinned second
    'EUR',
    'GBP',
    'JPY',
    'CAD',
    'AUD',
    'ARS',
    'CNY',
    'CHF',
    'BTC'  // Only crypto allowed
];
