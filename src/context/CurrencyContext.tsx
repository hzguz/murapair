import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [sourceCurrency, setSourceCurrency] = useState("BRL");
    const [targetCurrency, setTargetCurrency] = useState("USD");
    const [amount, setAmount] = useState("");
    const [convertedAmount, setConvertedAmount] = useState("");
    const [rates, setRates] = useState<Record<string, number>>({ BRL: 1 });
    const [isLoading, setIsLoading] = useState(true);

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
        if (!amount || isNaN(parseFloat(amount.replace(',', '.')))) {
            setConvertedAmount("");
            return;
        }

        // Algorithm: Covert Source -> BRL -> Target
        // 1. Convert Source to BRL: Amount * Rate(Source->BRL)
        // 2. Convert BRL to Target: BRLValue / Rate(Target->BRL)

        // Example: 10 USD -> ? EUR
        // USD->BRL Rate = 5.0. 10 USD = 50 BRL.
        // EUR->BRL Rate = 6.0. 50 BRL = 50/6 = 8.33 EUR.

        const val = parseFloat(amount.replace(',', '.'));
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
            isLoading
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
