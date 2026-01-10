import { Banknote, Bitcoin, Coins } from "lucide-react";
import { cn } from "../lib/utils";
import { useCurrency } from "../context/CurrencyContext";
import { motion } from "framer-motion";

const MODES = [
    { id: 'converter', label: 'Converter', icon: Banknote, mode: 'CONVERTER' },
    { id: 'bitcoin', label: 'Bitcoin', icon: Bitcoin, mode: 'BITCOIN' },
] as const;

export function BottomNavigation() {
    const { mode, setMode } = useCurrency();

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center p-1 rounded-full glass-heavy shadow-2xl shadow-black/50">
                {MODES.map((item) => {
                    const isActive = mode === item.mode;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setMode(item.mode)}
                            className="relative px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white/10 rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <item.icon
                                size={20}
                                className={cn(
                                    "relative z-10 transition-colors duration-300",
                                    isActive ? "text-white" : "text-white/50"
                                )}
                            />
                            <span
                                className={cn(
                                    "relative z-10 text-sm font-medium transition-colors duration-300",
                                    isActive ? "text-white" : "text-white/50"
                                )}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
