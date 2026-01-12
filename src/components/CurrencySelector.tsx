import { X, Star, Trash2, ArrowRight, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { useLanguage } from "../context/LanguageContext";
import { cn } from "../lib/utils";
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
    hidden: { opacity: 0, x: -10, scale: 0.98 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 100, damping: 20, mass: 0.5 }
    }
};

export function CurrencySelector({ isOpen, onClose, type }: CurrencySelectorProps) {
    const {
        sourceCurrency,
        targetCurrency,
        favorites,
        toggleFavorite,
        savedPairs,
        savePair,
        removePair,
        isPairSaved,
        setSourceCurrency: setGlobalSource,
        setTargetCurrency: setGlobalTarget
    } = useCurrency();
    const { t } = useLanguage();

    const [activeTab, setActiveTab] = useState<'currencies' | 'pairs'>('currencies');

    const [showTopGradient, setShowTopGradient] = useState(false);
    const [showBottomGradient, setShowBottomGradient] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const checkScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        setShowTopGradient(scrollTop > 10);
        setShowBottomGradient(scrollHeight - scrollTop > clientHeight + 10);
    };

    useEffect(() => {
        checkScroll();
        // Re-check when sortedCurrencies changes (filter update)
        checkScroll();
        // Re-check when sortedCurrencies changes (filter update)
    }, [isOpen, favorites, activeTab]); // favorites might change order

    // Logic Fix: Prevent selecting the same currency.
    // If we are selecting 'source', hide the currency that is currently 'target'.
    // If we are selecting 'target', hide the currency that is currently 'source'.
    const availableCurrencies = SUPPORTED_CURRENCIES.filter(c => {
        if (type === 'source') return c !== targetCurrency;
        if (type === 'target') return c !== sourceCurrency;
        return true;
    });

    const handleSelect = (curr: string) => {
        if (type === 'source') setGlobalSource(curr);
        else setGlobalTarget(curr);
        onClose();
    };

    const handleSelectPair = (source: string, target: string) => {
        setGlobalSource(source);
        setGlobalTarget(target);
        onClose();
    };

    // Sort: Favorites first, then Others. Within each group: Alphabetical (or default order)
    const sortedCurrencies = [...availableCurrencies].sort((a, b) => {
        const isFavA = favorites.includes(a);
        const isFavB = favorites.includes(b);
        if (isFavA && !isFavB) return -1;
        if (!isFavA && isFavB) return 1;
        return 0; // Maintain default order otherwise
    });

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
                        className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 pointer-events-auto"
                    />

                    {/* Drawer - Super Rounded & Floating */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-4 left-4 right-4 z-[60] bg-[#111] rounded-[2rem] border border-white/10 p-6 pb-2 h-[60vh] shadow-2xl origin-bottom flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6 px-2 shrink-0">
                            <h2 className="text-xl font-semibold text-white tracking-tight">{t.selectCurrency}</h2>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <X size={18} className="text-white" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-4 px-2">
                            <button
                                onClick={() => setActiveTab('currencies')}
                                className={cn(
                                    "flex-1 py-3 rounded-xl font-medium text-sm transition-all",
                                    activeTab === 'currencies'
                                        ? "bg-white text-black shadow-lg"
                                        : "bg-white/5 text-white/50 hover:bg-white/10"
                                )}
                            >
                                {t.selectCurrency}
                            </button>
                            <button
                                onClick={() => setActiveTab('pairs')}
                                className={cn(
                                    "flex-1 py-3 rounded-xl font-medium text-sm transition-all",
                                    activeTab === 'pairs'
                                        ? "bg-white text-black shadow-lg"
                                        : "bg-white/5 text-white/50 hover:bg-white/10"
                                )}
                            >
                                Saved Pairs
                            </button>
                        </div>

                        {/* Scrollable Container Wrapper with Relative for Gradients */}
                        <div className="flex-1 min-h-0 relative flex flex-col">

                            {/* Top Gradient - Conditional */}
                            <AnimatePresence>
                                {showTopGradient && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#111] to-transparent z-10 pointer-events-none"
                                    />
                                )}
                            </AnimatePresence>

                            <div
                                ref={scrollRef}
                                onScroll={checkScroll}
                                className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pr-2 pt-2 scroll-smooth"
                            >
                                {activeTab === 'currencies' ? (
                                    <motion.div
                                        key="currencies-list"
                                        layout
                                        variants={listVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="grid grid-cols-1 gap-2 pb-2"
                                    >
                                        {sortedCurrencies.map((curr) => {
                                            const isFav = favorites.includes(curr);

                                            return (
                                                <motion.div
                                                    layout
                                                    variants={itemVariants}
                                                    key={curr}
                                                    className="flex items-center gap-2"
                                                >
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleFavorite(curr);
                                                        }}
                                                        className="p-3 rounded-full hover:bg-white/10 transition-colors group/star"
                                                    >
                                                        <Star
                                                            size={16}
                                                            className={cn(
                                                                "transition-colors",
                                                                isFav ? "fill-amber-400 text-amber-400" : "text-white/20 group-hover/star:text-white/50"
                                                            )}
                                                        />
                                                    </button>

                                                    <button
                                                        onClick={() => handleSelect(curr)}
                                                        className="flex-1 flex items-center gap-4 p-3 rounded-[1.2rem] border border-white/5 bg-white/5 hover:bg-white/10 hover:scale-[1.01] active:scale-[0.99] transition-all group text-left"
                                                    >
                                                        <div className="w-12 h-12 rounded-full overflow-hidden shadow-md">
                                                            <CurrencyIcon currency={curr} className="w-full h-full" />
                                                        </div>
                                                        <div className="flex flex-col items-start">
                                                            <span className="text-lg font-semibold text-white tracking-tight">{curr}</span>
                                                            <span className="text-xs text-white/50 font-medium">
                                                                {t.currencies[curr] || curr}
                                                            </span>
                                                        </div>
                                                    </button>
                                                </motion.div>
                                            )
                                        })}
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col gap-2 pb-2">
                                        {/* Empty State - Show when NO pairs saved at all */}
                                        {savedPairs.length === 0 && (
                                            <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-sm py-10">
                                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                                    <Star size={24} className="opacity-50" />
                                                </div>
                                                <p>No pairs saved yet.</p>
                                            </div>
                                        )}

                                        <AnimatePresence mode="popLayout">
                                            {savedPairs.map((pair) => (
                                                <motion.div
                                                    key={`${pair.source}-${pair.target}`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -50 }}
                                                    layout
                                                    className="flex items-center gap-2"
                                                >
                                                    <button
                                                        onClick={() => handleSelectPair(pair.source, pair.target)}
                                                        className="flex-1 flex items-center gap-3 p-3 rounded-[1.2rem] border border-white/5 bg-white/5 hover:bg-white/10 hover:scale-[1.01] active:scale-[0.99] transition-all group text-left"
                                                    >
                                                        <div className="flex items-center -space-x-2">
                                                            <div className="w-10 h-10 rounded-full overflow-hidden shadow-md z-10 border-2 border-[#111]">
                                                                <CurrencyIcon currency={pair.source} className="w-full h-full" />
                                                            </div>
                                                            <div className="w-10 h-10 rounded-full overflow-hidden shadow-md z-0 border-2 border-[#111]">
                                                                <CurrencyIcon currency={pair.target} className="w-full h-full" />
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-start pl-2">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-base font-semibold text-white tracking-tight">{pair.source}</span>
                                                                <ArrowRight size={12} className="text-white/30" />
                                                                <span className="text-base font-semibold text-white tracking-tight">{pair.target}</span>
                                                            </div>
                                                            <span className="text-xs text-white/40 font-medium">
                                                                {pair.source === sourceCurrency && pair.target === targetCurrency ? '(Active)' : 'Load Pair'}
                                                            </span>
                                                        </div>
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removePair(pair.source, pair.target);
                                                        }}
                                                        className="p-3 rounded-full hover:bg-red-500/20 hover:text-red-400 text-white/20 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>

                            {/* Bottom Gradient - Conditional */}
                            <AnimatePresence>
                                {showBottomGradient && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#111] to-transparent z-10 pointer-events-none"
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Fixed Save Button - Only show in Pairs tab */}
                        {activeTab === 'pairs' && !isPairSaved(sourceCurrency, targetCurrency) && (
                            <div className="shrink-0 pt-4 pb-2 px-2">
                                <button
                                    onClick={() => savePair(sourceCurrency, targetCurrency)}
                                    className="w-full p-4 rounded-[1.2rem] bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
                                >
                                    <Save size={18} className="text-white" />
                                    <span className="text-white font-semibold">
                                        Save {sourceCurrency} → {targetCurrency}
                                    </span>
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
