import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useCurrency } from "../context/CurrencyContext";
import { SUPPORTED_CURRENCIES } from "../lib/constants";
import { CurrencyIcon } from "./CurrencyIcon";

interface CurrencySelectorProps {
    isOpen: boolean;
    onClose: () => void;
    type: "source" | "target";
}

const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
};

export function CurrencySelector({ isOpen, onClose, type }: CurrencySelectorProps) {
    const { sourceCurrency, targetCurrency, setSourceCurrency, setTargetCurrency } = useCurrency();

    // Logic Fix: Prevent selecting the same currency.
    // If we are selecting 'source', hide the currency that is currently 'target'.
    // If we are selecting 'target', hide the currency that is currently 'source'.
    const availableCurrencies = SUPPORTED_CURRENCIES.filter(c => {
        if (type === 'source') return c !== targetCurrency;
        if (type === 'target') return c !== sourceCurrency;
        return true;
    });

    const handleSelect = (curr: string) => {
        if (type === 'source') setSourceCurrency(curr);
        else setTargetCurrency(curr);
        onClose();
    };

    const getCurrencyName = (curr: string) => {
        const names = {
            'BRL': 'Real Brasileiro',
            'USD': 'Dólar Americano',
            'EUR': 'Euro',
            'GBP': 'Libra Esterlina',
            'BTC': 'Bitcoin'
        };
        return names[curr as keyof typeof names] || curr;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 pointer-events-auto"
                    />

                    {/* Drawer - Super Rounded & Floating */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-4 left-4 right-4 z-[60] bg-[#111] rounded-[2rem] border border-white/10 p-6 pb-8 max-h-[80vh] overflow-y-auto shadow-2xl origin-bottom"
                    >
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h2 className="text-xl font-semibold text-white tracking-tight">Selecionar Moeda</h2>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <X size={18} className="text-white" />
                            </button>
                        </div>

                        <motion.div
                            variants={listVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 gap-2"
                        >
                            {availableCurrencies.map((curr) => (
                                <motion.button
                                    variants={itemVariants}
                                    key={curr}
                                    onClick={() => handleSelect(curr)}
                                    className="flex items-center gap-4 p-3 rounded-[1.2rem] border border-white/5 bg-white/5 hover:bg-white/10 hover:scale-[1.01] active:scale-[0.99] transition-all group text-left"
                                >
                                    <div className="w-12 h-12 rounded-full overflow-hidden shadow-md">
                                        <CurrencyIcon currency={curr} className="w-full h-full" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-lg font-semibold text-white tracking-tight">{curr}</span>
                                        <span className="text-xs text-white/50 font-medium">
                                            {getCurrencyName(curr)}
                                        </span>
                                    </div>
                                </motion.button>
                            ))}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
