import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
    className?: string;
    variant?: "heavy" | "default";
    children?: ReactNode;
}

export function GlassCard({ className, variant = "default", children, ...props }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
                "rounded-3xl p-6 shadow-xl border border-white/10 relative overflow-hidden",
                variant === "heavy" ? "bg-white/10 backdrop-blur-xl" : "bg-white/5 backdrop-blur-lg",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}
