import { ChevronDown, Lock } from "lucide-react";
import { cn } from "../lib/utils";
import { CurrencyIcon } from "./CurrencyIcon";
import { MotionNumber } from "./MotionNumber";
import { motion, AnimatePresence } from "framer-motion";

const COLOR_THEMES: Record<string, { border: string, bg: string, text: string, glow: string }> = {
    'emerald': { border: 'border-emerald-500/10', bg: 'bg-emerald-500/10', text: 'text-emerald-400/60', glow: 'bg-emerald-500/20' },
    'red': { border: 'border-red-500/10', bg: 'bg-red-500/10', text: 'text-red-400/60', glow: 'bg-red-600/20' },
    'orange': { border: 'border-orange-500/10', bg: 'bg-white/5', text: 'text-orange-400/60', glow: 'bg-orange-600/20' },
    'blue': { border: 'border-blue-500/10', bg: 'bg-blue-500/10', text: 'text-blue-400/60', glow: 'bg-blue-600/20' },
    'rose': { border: 'border-rose-500/10', bg: 'bg-rose-500/10', text: 'text-rose-400/60', glow: 'bg-rose-600/20' },
    'purple': { border: 'border-purple-500/10', bg: 'bg-purple-500/10', text: 'text-purple-400/60', glow: 'bg-purple-400/20' },
    'default': { border: 'border-white/5', bg: 'bg-white/5', text: 'text-white/60', glow: 'bg-white/10' }
};

interface CurrencyCardProps {
    type: "source" | "target";
    value: string;
    currency: string;
    onValueChange?: (val: string) => void;
    onCurrencyChange?: () => void;
    readOnly?: boolean;
    isLocked?: boolean;
    themeColor?: string;
}

export function CurrencyCard({
    type,
    value,
    currency,
    onValueChange,
    onCurrencyChange,
    readOnly,
    isLocked,
    themeColor = 'default'
}: CurrencyCardProps) {

    const theme = COLOR_THEMES[themeColor] || COLOR_THEMES['default'];

    const formatCalculatorInput = (val: string, currency: string) => {
        // Determine locale-specific separators
        const isCommaDecimal = (currency === 'BRL' || currency === 'EUR');
        const decimalChar = isCommaDecimal ? ',' : '.';
        const thousandChar = isCommaDecimal ? '.' : ',';

        // 1. Sanitize: Allow only digits and the valid decimal separator
        // Replace alternate separator if typed (e.g. user types dot in BRL mode -> convert to comma)
        let sanitized = val;
        if (isCommaDecimal) {
            sanitized = sanitized.replace(/\./g, ',');
        } else {
            sanitized = sanitized.replace(/,/g, '.');
        }

        // Remove invalid chars
        sanitized = sanitized.replace(new RegExp(`[^0-9${decimalChar}]`, 'g'), '');

        // Handle multiple decimal separators: keep only the first one
        const parts = sanitized.split(decimalChar);
        let integerPart = parts[0];
        let decimalPart = parts.length > 1 ? parts.slice(1).join('') : null;

        // 2. Format Integer Part with Thousands Separators
        // Remove leading zeros unless it's just "0"
        if (integerPart.length > 1 && integerPart.startsWith('0')) {
            integerPart = integerPart.replace(/^0+/, '');
        }
        if (integerPart === '') integerPart = '0';

        // Apply thousands separator (1000 -> 1.000 or 1,000)
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandChar);

        // 3. Reconstruct
        let finalValue = formattedInteger;

        if (decimalPart !== null) {
            // Limit decimal places (optional, but good for currency)
            const maxDecimals = currency === 'BTC' ? 8 : 2;
            if (decimalPart.length > maxDecimals) {
                decimalPart = decimalPart.slice(0, maxDecimals);
            }
            finalValue += decimalChar + decimalPart;
        }

        // Edge case: empty input -> empty output (or 0)
        if (val === '') return '';

        return finalValue;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!onValueChange) return;
        const formatted = formatCalculatorInput(e.target.value, currency);
        onValueChange(formatted);
    };

    return (
        <div
            className={cn(
                "w-full h-full p-6 md:p-24 flex flex-col justify-center gap-6 transition-all duration-500 relative overflow-hidden group/card",
                type === "source"
                    ? "bg-gradient-to-b from-white/5 to-transparent border-b md:border-b-0 md:border-r border-white/5 z-20 -mb-px md:mb-0 md:-mr-px"
                    : "bg-gradient-to-t from-white/5 to-transparent transition-colors z-10"
            )}
        >
            <div className="flex justify-between items-center w-full z-10">
                <div className="flex flex-col">
                    {isLocked && (
                        <span className="flex items-center gap-2 text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-3 ml-1">
                            <Lock size={12} className="animate-pulse" /> Taxa Fixa
                        </span>
                    )}
                    <button onClick={onCurrencyChange} className="flex items-center gap-4 group/btn text-left">

                        {/* Dynamic Icon Container */}
                        <div className={cn(
                            "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border transition-all duration-300 shadow-xl group-hover/btn:scale-105 shrink-0 relative overflow-hidden",
                            theme.border,
                            theme.bg
                        )}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currency}
                                    initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <CurrencyIcon currency={currency} className="w-8 h-8 md:w-10 md:h-10" />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="flex flex-col items-start gap-0.5 overflow-hidden">
                            <div className="flex items-center gap-2 relative">
                                {/* TEXT ANIMATION: CURRENCY NAME */}
                                <div className="relative">
                                    <span className="text-3xl md:text-4xl font-semibold opacity-0 select-none tracking-tight">{currency}</span>
                                    <div className="absolute inset-0">
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={currency}
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="text-3xl md:text-4xl font-semibold text-white tracking-tight block whitespace-nowrap"
                                            >
                                                {currency}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {!isLocked && <ChevronDown size={18} className="text-white/30 group-hover/btn:text-white transition-colors ml-1" />}
                            </div>

                            {/* TEXT ANIMATION: LABEL */}
                            <div className="relative h-5 w-full">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={currency + type}
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: 10, opacity: 0 }}
                                        transition={{ duration: 0.2, delay: 0.05 }}
                                        className={cn("text-sm font-light pl-0.5 tracking-tight absolute inset-0 whitespace-nowrap", theme.text)}
                                    >
                                        {type === 'source' ? 'Você envia' : 'Você recebe'}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2 mt-2 z-10 relative">
                {readOnly ? (
                    <MotionNumber
                        value={value || "0"}
                        currency={currency}
                        className={cn(
                            "bg-transparent font-medium text-white block w-full text-left tracking-tight transition-all",
                            value.length > 8 ? "text-4xl md:text-5xl" : "text-5xl md:text-6xl",
                            "cursor-default text-white/80"
                        )}
                    />
                ) : (
                    <input
                        type="text"
                        inputMode="decimal"
                        value={value}
                        onChange={handleInputChange}
                        readOnly={readOnly}
                        placeholder="0,00"
                        // Prevent invalid chars
                        onKeyDown={(e) => {
                            // Allow control keys
                            if ([46, 8, 9, 27, 13, 110, 190, 188].indexOf(e.keyCode) !== -1 ||
                                (e.ctrlKey === true && [65, 67, 86, 88].indexOf(e.keyCode) !== -1) ||
                                (e.keyCode >= 35 && e.keyCode <= 39)) return;
                            // Ensure only numbers (mask will handle the rest)
                            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                e.preventDefault();
                            }
                        }}
                        className={cn(
                            "bg-transparent font-medium text-white placeholder:text-white/5 outline-none w-full text-left tracking-tight transition-all",
                            value.length > 8 ? "text-4xl md:text-5xl" : "text-5xl md:text-6xl",
                            "cursor-text"
                        )}
                        style={{ fontWeight: 500 }}
                    />
                )}
            </div>

            {/* Dynamic Corner Glow */}
            <motion.div
                animate={{
                    backgroundColor: theme.glow.includes('emerald') ? 'rgba(16, 185, 129, 0.2)' :
                        theme.glow.includes('red') ? 'rgba(220, 38, 38, 0.2)' :
                            theme.glow.includes('orange') ? 'rgba(249, 115, 22, 0.2)' :
                                theme.glow.includes('blue') ? 'rgba(37, 99, 235, 0.2)' :
                                    theme.glow.includes('rose') ? 'rgba(244, 63, 94, 0.2)' :
                                        'rgba(255, 255, 255, 0.1)'
                }}
                transition={{ duration: 0.5 }}
                className={cn(
                    "absolute pointer-events-none opacity-20 blur-[100px]",
                    type === "source" ? "top-0 right-0 w-64 h-64" : "bottom-0 left-0 w-64 h-64"
                )}
            />

        </div>
    );
}
