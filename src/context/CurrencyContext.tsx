import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

// AwesomeAPI response type
interface AwesomeAPIRate {
    code: string;
    codein: string;
    name: string;
    high: string;
    low: string;
    varBid: string;
    pctChange: string;
    bid: string;
    ask: string;
    timestamp: string;
    create_date: string;
}

type AwesomeAPIResponse = Record<string, AwesomeAPIRate>;

interface CurrencyContextType {
    sourceCurrency: string;
    targetCurrency: string;
    amount: string;
    convertedAmount: string;
    setSourceCurrency: (c: string) => void;
    setTargetCurrency: (c: string) => void;
    setAmount: (a: string) => void;
    swapCurrencies: () => void;
    isLoading: boolean;
    lastUpdated: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [sourceCurrency, setSourceCurrency] = useState("BRL");
    const [targetCurrency, setTargetCurrency] = useState("USD");
    const [amount, setAmount] = useState("");
    const [convertedAmount, setConvertedAmount] = useState("");
    const [rates, setRates] = useState<Record<string, number>>({ BRL: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    // Fetch Real-Time Rates from AwesomeAPI (Free, Secure, No Key)
    // We fetch everything relative to BRL (Real) because it's the API's native base.
    // Pairs: USD-BRL, EUR-BRL, GBP-BRL, BTC-BRL
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const pairs = "USD-BRL,EUR-BRL,GBP-BRL,BTC-BRL";
                const response = await fetch(`https://economia.awesomeapi.com.br/last/${pairs}`);
                const data: AwesomeAPIResponse = await response.json();

                // Normalize rates to be "Value in BRL"
                // e.g., USDBRL bid = 5.00 means 1 USD = 5.00 BRL
                const newRates: Record<string, number> = {
                    BRL: 1,
                    USD: parseFloat(data.USDBRL.bid),
                    EUR: parseFloat(data.EURBRL.bid),
                    GBP: parseFloat(data.GBPBRL.bid),
                    BTC: parseFloat(data.BTCBRL.bid),
                };

                setRates(newRates);
                setLastUpdated(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch rates:", error);
                // Fallback static rates if API fails (just so app works)
                setRates({
                    BRL: 1,
                    USD: 5.50,
                    EUR: 6.00,
                    GBP: 7.00,
                    BTC: 350000
                });
                setIsLoading(false);
            }
        };

        fetchRates();
        // Poll every 30 seconds for real-time vibe
        const interval = setInterval(fetchRates, 30000);
        return () => clearInterval(interval);
    }, []);

    // Conversion Logic
    useEffect(() => {
        // Parse amount: Handle localized format (BRL uses "1.234,56", USD uses "1,234.56")
        // Detect format by checking if comma exists (indicates BRL/EUR decimal)
        let normalizedAmount = amount;
        if (amount.includes(',')) {
            // Likely BRL/EUR: dot is thousands, comma is decimal
            normalizedAmount = amount.replace(/\./g, '').replace(',', '.');
        } else {
            // Likely USD: comma is thousands, dot is decimal
            normalizedAmount = amount.replace(/,/g, '');
        }

        const val = parseFloat(normalizedAmount);
        if (isNaN(val)) {
            setConvertedAmount("");
            return;
        }
        const sourceRate = rates[sourceCurrency] || 1;
        const targetRate = rates[targetCurrency] || 1;

        const valInBRL = val * sourceRate;
        const result = valInBRL / targetRate;

        // Precision
        const precision = targetCurrency === 'BTC' ? 8 : 2;
        setConvertedAmount(result.toLocaleString('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: precision
        }));

    }, [amount, sourceCurrency, targetCurrency, rates]);

    const swapCurrencies = () => {
        setSourceCurrency(targetCurrency);
        setTargetCurrency(sourceCurrency);
    };

    return (
        <CurrencyContext.Provider value={{
            sourceCurrency,
            targetCurrency,
            amount,
            setAmount,
            convertedAmount,
            setSourceCurrency,
            setTargetCurrency,
            swapCurrencies,
            isLoading,
            lastUpdated
        }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
}
