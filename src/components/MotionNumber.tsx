import { useEffect, useRef } from "react";
import { useSpring, useMotionValue } from "framer-motion";

export function MotionNumber({ value, className, currency }: { value: string, className?: string, currency: string }) {

    const parseValue = (v: string) => {
        try {
            if (!v) return 0;
            const safeV = String(v);
            // en-US format: remove commas (thousands separator)
            const normalized = safeV.replace(/,/g, '');
            const floatVal = parseFloat(normalized);
            return isNaN(floatVal) || floatVal < 0 ? 0 : floatVal;
        } catch {
            return 0;
        }
    };

    const target = parseValue(value);
    const motionVal = useMotionValue(target);

    // Very fast spring: almost instant
    const spring = useSpring(motionVal, {
        stiffness: 800,
        damping: 50,
        mass: 0.1
    });

    useEffect(() => {
        motionVal.set(target);
    }, [target, motionVal]);

    const ref = useRef<HTMLSpanElement>(null);
    const precision = currency === 'BTC' ? 8 : 2;

    useEffect(() => {
        const unsubscribe = spring.on("change", (latest) => {
            if (ref.current) {
                // Clamp to prevent negative values during animation
                const safeValue = Math.max(0, latest);
                const formatted = safeValue.toLocaleString('en-US', {
                    minimumFractionDigits: precision,
                    maximumFractionDigits: precision
                });
                ref.current.textContent = formatted;
            }
        });
        return () => unsubscribe();
    }, [spring, precision]);

    // Initial render with formatted value
    const initialFormatted = target.toLocaleString('en-US', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
    });

    return <span ref={ref} className={className}>{initialFormatted}</span>;
}
