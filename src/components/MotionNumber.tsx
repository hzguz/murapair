import { useEffect, useRef } from "react";
import { useSpring, useMotionValue, useTransform, motion } from "framer-motion";

interface AnimatedValueProps {
    value: string;
    className?: string;
}

export function AnimatedValue({ value, className }: AnimatedValueProps) {
    // 1. Parse numeric value from string (handling locale commas/dots)
    // We assume input formatting is already handled, but we need raw float for animation.
    const parseValue = (v: string) => {
        if (!v) return 0;
        // Replace comma with dot for JS float parsing
        // Remove thousands separators if implemented (not yet, but good practice)
        // Here we just handle basic comma/dot swap
        const normalized = v.replace(',', '.');
        const floatVal = parseFloat(normalized);
        return isNaN(floatVal) ? 0 : floatVal;
    };

    const numericValue = parseValue(value);

    // 2. Motion Value & Spring
    // We animate a motion value 'mv' to the target 'numericValue'
    const mv = useMotionValue(0);
    const springValue = useSpring(mv, { stiffness: 100, damping: 20, mass: 1 });

    useEffect(() => {
        mv.set(numericValue);
    }, [numericValue, mv]);

    // 3. Transform back to string for display
    // We need to re-format it to the display format (comma for decimals if needed)
    // This is tricky because pure spring gives floats like 12.34567. 
    // We need to match the user's input precision.

    // Simplification: For INPUTS (Source), we usually don't want spring because it fights the typing cursor.
    // Spring is best for OUTPUTS (Target) which change automatically.

    // If this component is used for typing input, it will be weird.
    // STRATEGY: IF this is "readOnly" (Target), use Spring. 
    // IF this is "input" (Source), render raw text.

    return (
        <span className={className}>{value}</span>
    );
}

// Actual Motion Component specifically for the Target (Output)
export function MotionNumber({ value, className, currency }: { value: string, className?: string, currency: string }) {
    const parseValue = (v: string) => {
        if (!v) return 0;
        // BRL/EUR use comma decimal. USD/BTC use dot (in our mixed logic).
        // Let's strip non-numeric/dot/comma
        // If it has comma, replace with dot
        return parseFloat(v.replace(/\./g, '').replace(',', '.'));
    };

    const target = parseValue(value);
    const motionVal = useMotionValue(target);
    const spring = useSpring(motionVal, { stiffness: 75, damping: 18 });

    useEffect(() => {
        motionVal.set(target);
    }, [target]);

    // Format Logic
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const unsubscribe = spring.on("change", (latest) => {
            if (ref.current) {
                // Formatting back to locale string
                // Determine precision based on currency or value string length
                const precision = currency === 'BTC' ? 8 : 2;

                // Helper to format
                const formatted = latest.toLocaleString('pt-BR', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: precision
                });

                ref.current.textContent = formatted;
            }
        });
        return () => unsubscribe();
    }, [spring, currency]);

    return <span ref={ref} className={className}>{value}</span>;
}
