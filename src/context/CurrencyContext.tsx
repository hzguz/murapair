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



export interface SavedPair {
    source: string;
    target: string;
}

export interface CurrencyContextType {
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
    favorites: string[];
    toggleFavorite: (currency: string) => void;
    savedPairs: SavedPair[];
    savePair: (source: string, target: string) => void;
    removePair: (source: string, target: string) => void;
    isPairSaved: (source: string, target: string) => boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    // Initialize Default (No persistence for active selection as per user request to avoid "auto-saving")
    const [sourceCurrency, setSourceCurrency] = useState("BRL");
    const [targetCurrency, setTargetCurrency] = useState("USD");
    const [favorites, setFavorites] = useState<string[]>(() => {
        const saved = localStorage.getItem('favorites');
        return saved ? JSON.parse(saved) : [];
    });

    const [savedPairs, setSavedPairs] = useState<SavedPair[]>(() => {
        const saved = localStorage.getItem('savedPairs');
        return saved ? JSON.parse(saved) : [];
    });

    const [amount, setAmount] = useState("");
    const [convertedAmount, setConvertedAmount] = useState("");
    const [rates, setRates] = useState<Record<string, number>>({ BRL: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    // Persistence Effects
    // source/target currency are NOT persisted anymore (Manual only)
    useEffect(() => { localStorage.setItem('favorites', JSON.stringify(favorites)); }, [favorites]);
    useEffect(() => { localStorage.setItem('savedPairs', JSON.stringify(savedPairs)); }, [savedPairs]);

    const toggleFavorite = (curr: string) => {
        setFavorites(prev =>
            prev.includes(curr)
                ? prev.filter(c => c !== curr)
                : [...prev, curr]
        );
    };

    const savePair = (source: string, target: string) => {
        if (savedPairs.some(p => p.source === source && p.target === target)) return;
        setSavedPairs(prev => [...prev, { source, target }]);
    };

    const removePair = (source: string, target: string) => {
        setSavedPairs(prev => prev.filter(p => !(p.source === source && p.target === target)));
    };

    const isPairSaved = (source: string, target: string) => {
        return savedPairs.some(p => p.source === source && p.target === target);
    };

    // Fetch Real-Time Rates from AwesomeAPI (Free, Secure, No Key)
    // We fetch everything relative to BRL (Real) because it's the API's native base.
    useEffect(() => {
        const fetchRates = async () => {
            try {
                // Expanded list of pairs
                const pairs = "USD-BRL,EUR-BRL,GBP-BRL,BTC-BRL,JPY-BRL,CAD-BRL,AUD-BRL,ARS-BRL,CNY-BRL,CHF-BRL";
                const response = await fetch(`https://economia.awesomeapi.com.br/last/${pairs}`);
                const data: AwesomeAPIResponse = await response.json();

                // Normalize rates to be "Value in BRL" (Bid Price)
                const newRates: Record<string, number> = {
                    BRL: 1,
                    USD: parseFloat(data.USDBRL?.bid || "0"),
                    EUR: parseFloat(data.EURBRL?.bid || "0"),
                    GBP: parseFloat(data.GBPBRL?.bid || "0"),
                    BTC: parseFloat(data.BTCBRL?.bid || "0"),
                    JPY: parseFloat(data.JPYBRL?.bid || "0"),
                    CAD: parseFloat(data.CADBRL?.bid || "0"),
                    AUD: parseFloat(data.AUDBRL?.bid || "0"),
                    ARS: parseFloat(data.ARSBRL?.bid || "0"),
                    CNY: parseFloat(data.CNYBRL?.bid || "0"),
                    CHF: parseFloat(data.CHFBRL?.bid || "0"),
                };

                setRates(newRates);
                setLastUpdated(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch rates:", error);
                // Fallback static rates if API fails
                setRates({
                    BRL: 1, USD: 5.50, EUR: 6.00, GBP: 7.00, BTC: 350000,
                    JPY: 0.038, CAD: 4.05, AUD: 3.65, ARS: 0.006, CNY: 0.76, CHF: 6.20
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
        // Parse amount based on SOURCE currency format
        // BRL/EUR use comma as decimal separator: "1.234,56"
        // USD/GBP/BTC use dot as decimal separator: "1,234.56"
        let normalizedAmount = amount;
        const isSourceCommaDecimal = (sourceCurrency === 'BRL' || sourceCurrency === 'EUR');

        if (isSourceCommaDecimal) {
            // BRL/EUR: dot is thousands, comma is decimal
            normalizedAmount = amount.replace(/\./g, '').replace(',', '.');
        } else {
            // USD/GBP/BTC: comma is thousands, dot is decimal
            normalizedAmount = amount.replace(/,/g, '');
        }

        const val = parseFloat(normalizedAmount);
        if (isNaN(val) || val === 0) {
            setConvertedAmount("");
            return;
        }

        const sourceRate = rates[sourceCurrency] || 1;
        const targetRate = rates[targetCurrency] || 1;

        const valInBRL = val * sourceRate;
        const result = valInBRL / targetRate;

        // Format using en-US locale (comma=thousands, dot=decimal)
        const precision = targetCurrency === 'BTC' ? 8 : 2;

        setConvertedAmount(result.toLocaleString('en-US', {
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
            lastUpdated,
            favorites,
            toggleFavorite,
            savedPairs,
            savePair,
            removePair,
            isPairSaved
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
