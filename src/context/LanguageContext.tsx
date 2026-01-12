import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type Language = 'en' | 'pt';

interface Translations {
    from: string;
    to: string;
    thousand: string;
    million: string;
    billion: string;
    trillion: string;
    quadrillion: string;
    selectCurrency: string;
    currencies: Record<string, string>;
    plural: {
        million: string;
        billion: string;
        trillion: string;
        quadrillion: string;
    }
}

const translations: Record<Language, Translations> = {
    pt: {
        from: 'De',
        to: 'Para',
        thousand: 'Mil',
        million: 'Milhão',
        billion: 'Bilhão',
        trillion: 'Trilhão',
        quadrillion: 'Quatrilhão',
        selectCurrency: 'Selecione a Moeda',
        currencies: {
            'BRL': 'Real Brasileiro',
            'USD': 'Dólar Americano',
            'EUR': 'Euro',
            'GBP': 'Libra Esterlina',
            'BTC': 'Bitcoin',
            'JPY': 'Iene Japonês',
            'CAD': 'Dólar Canadense',
            'AUD': 'Dólar Australiano',
            'ARS': 'Peso Argentino',
            'CNY': 'Yuan Chinês',
            'CHF': 'Franco Suíço',
            'NZD': 'Dólar Neozelandês',
            'SGD': 'Dólar de Singapura'
        },
        plural: {
            million: 'Milhões',
            billion: 'Bilhões',
            trillion: 'Trilhões',
            quadrillion: 'Quatrilhões',
        }
    },
    en: {
        from: 'From',
        to: 'To',
        thousand: 'k',
        million: 'Million',
        billion: 'Billion',
        trillion: 'Trillion',
        quadrillion: 'Quadrillion',
        selectCurrency: 'Select Currency',
        currencies: {
            'BRL': 'Brazilian Real',
            'USD': 'US Dollar',
            'EUR': 'Euro',
            'GBP': 'British Pound',
            'BTC': 'Bitcoin',
            'JPY': 'Japanese Yen',
            'CAD': 'Canadian Dollar',
            'AUD': 'Australian Dollar',
            'ARS': 'Argentine Peso',
            'CNY': 'Chinese Yuan',
            'CHF': 'Swiss Franc',
            'NZD': 'New Zealand Dollar',
            'SGD': 'Singapore Dollar'
        },
        plural: {
            million: 'Millions',
            billion: 'Billions',
            trillion: 'Trillions',
            quadrillion: 'Quadrillions',
        }
    }
};

interface LanguageContextType {
    language: Language;
    t: Translations;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('en'); // Default to EN

    useEffect(() => {
        const detectCountry = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (data.country_code === 'BR') {
                    setLanguage('pt');
                } else {
                    setLanguage('en');
                }
            } catch (error) {
                console.error("Failed to detect country:", error);
                // Fallback to browser language if API fails
                if (navigator.language.startsWith('pt')) {
                    setLanguage('pt');
                }
            }
        };

        detectCountry();
    }, []);

    return (
        <LanguageContext.Provider value={{ language, t: translations[language], setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
