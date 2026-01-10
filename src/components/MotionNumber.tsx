import { useEffect, useRef } from "react";
import { useSpring, useMotionValue } from "framer-motion";

export function MotionNumber({ value, className, currency }: { value: string, className?: string, currency: string }) {

    // Safer parse function that guarantees a number return
    const parseValue = (v: string) => {
        try {
            if (!v) return 0;
            // Ensure v is string
            const safeV = String(v);

            let normalized = safeV;
            // Heuristic: If it has comma, assume comma is decimal (BRL/EUR) OR thousands (USD)
            // Ideally we should use the currency prop to decide strictly.

            const isCommaDecimal = (currency === 'BRL' || currency === 'EUR');

            if (isCommaDecimal) {
                // Remove all dots (thousands)
                normalized = normalized.replace(/\./g, '');
                // Replace comma with dot
                normalized = normalized.replace(',', '.');
            } else {
                // Remove all commas (thousands)
                normalized = normalized.replace(/,/g, '');
            }

            const floatVal = parseFloat(normalized);
            return isNaN(floatVal) ? 0 : floatVal;
        } catch (e) {
            console.warn("MotionNumber parse error:", e);
            return 0;
        }
    };

    const target = parseValue(value);
    const motionVal = useMotionValue(target);
    const spring = useSpring(motionVal, { stiffness: 250, damping: 30 });

    useEffect(() => {
        motionVal.set(target);
    }, [target]);

    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const unsubscribe = spring.on("change", (latest) => {
            if (ref.current) {
                try {
                    const precision = currency === 'BTC' ? 8 : 2;
                    const locale = (currency === 'BRL' || currency === 'EUR') ? 'pt-BR' : 'en-US';

                    const formatted = latest.toLocaleString(locale, {
                        minimumFractionDigits: precision,
                        maximumFractionDigits: precision
                    });

                    ref.current.textContent = formatted;
                } catch (e) {
                    ref.current.textContent = "Error";
                }
            }
        });
        return () => unsubscribe();
    }, [spring, currency]);

    return <span ref={ref} className={className}>{value}</span>;
}
