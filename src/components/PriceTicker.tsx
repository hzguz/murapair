import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign } from "lucide-react";

interface TickerData {
    btcPrice: string;
    usdToBrl: string;
}

export function PriceTicker() {
    const [data, setData] = useState<TickerData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    "https://economia.awesomeapi.com.br/last/USD-BRL,BTC-USD"
                );
                const json = await response.json();

                // json format: { USDBRL: { bid: "...", ... }, BTCUSD: { bid: "...", ... } }
                const btc = parseFloat(json.BTCUSD.bid);
                const usdBrlBid = parseFloat(json.USDBRL.bid);

                // USDBRL.bid means 1 USD = X BRL
                const brlVal = usdBrlBid;

                setData({
                    btcPrice: btc.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
                    usdToBrl: brlVal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
                });
            } catch (error) {
                console.error("Failed to fetch ticker data", error);
            }
        };

        fetchData();
        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!data) return null;

    return (
        <div className="w-full bg-black/5 backdrop-blur-lg border-b border-white/5 relative overflow-hidden h-10 flex items-center z-50">
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none z-10" />

            {/* Container for the sliding content */}
            <div className="flex w-full overflow-hidden mask-linear-fade select-none">
                <motion.div
                    className="flex whitespace-nowrap"
                    animate={{ x: "-50%" }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 40,
                    }}
                >
                    {/* Render content multiple times to ensure it covers screens of all sizes */}
                    {[0, 1].map((setIndex) => (
                        <div key={setIndex} className="flex gap-12 md:gap-24 px-6 md:px-12 items-center">
                            {/* We repeat the items enough times to surely fill the viewport width even on large screens before the wrap happens */}
                            {[1, 2, 3, 4].map((i) => (
                                <div key={`${setIndex}-${i}`} className="flex gap-12 md:gap-24 items-center text-xs font-medium text-white/40 tracking-wide uppercase">
                                    <span className="flex items-center gap-2">
                                        <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-70" />
                                        <span>BTC</span>
                                        <span className="text-white/80 font-semibold tracking-normal normal-case">{data.btcPrice}</span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <DollarSign className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-70" />
                                        <span>USD</span>
                                        <span className="text-white/80 font-semibold tracking-normal normal-case">{data.usdToBrl}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
