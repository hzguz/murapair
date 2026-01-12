import { cn } from "../lib/utils";

interface CurrencyIconProps {
    currency: string;
    className?: string;
}

export function CurrencyIcon({ currency, className }: CurrencyIconProps) {
    // Mapping approach:
    // Fiat -> Country Flags (FlagCDN)
    // Crypto -> Crypto Icons (CoinCap or similar stable CDN)

    const getIconUrl = (code: string) => {
        switch (code) {
            case 'BTC':
                return "https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg"; // Vector SVG for sharpness
            case 'USD':
                return "https://flagcdn.com/w80/us.png";
            case 'BRL':
                return "https://flagcdn.com/w80/br.png";
            case 'EUR':
                return "https://flagcdn.com/w80/eu.png";
            case 'GBP':
                return "https://flagcdn.com/w80/gb.png";
            case 'JPY':
                return "https://flagcdn.com/w80/jp.png";
            case 'CAD':
                return "https://flagcdn.com/w80/ca.png";
            case 'AUD':
                return "https://flagcdn.com/w80/au.png";
            case 'ARS':
                return "https://flagcdn.com/w80/ar.png";
            case 'CNY':
                return "https://flagcdn.com/w80/cn.png";
            case 'CHF':
                return "https://flagcdn.com/w80/ch.png";
            case 'NZD':
                return "https://flagcdn.com/w80/nz.png";
            case 'SGD':
                return "https://flagcdn.com/w80/sg.png";
            default:
                return null;
        }
    };

    const iconUrl = getIconUrl(currency);

    if (iconUrl) {
        return (
            <img
                src={iconUrl}
                alt={currency}
                className={cn("w-full h-full object-cover rounded-full", className)}
                onError={(e) => {
                    // Fallback if image fails
                    e.currentTarget.style.display = 'none';
                }}
            />
        );
    }

    // Fallback System if code not mapped above (though we only have 5 currencies now)
    return (
        <div className={cn("w-full h-full flex items-center justify-center font-bold bg-white/10 rounded-full", className)}>
            {currency[0]}
        </div>
    );
}
