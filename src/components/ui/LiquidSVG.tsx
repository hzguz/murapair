export function LiquidSVG() {
    return (
        <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
            <defs>
                <filter id="liquid-glass">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.01 0.01"
                        numOctaves="3"
                        result="warp"
                    >
                        <animate
                            attributeName="baseFrequency"
                            values="0.01 0.01; 0.02 0.02; 0.01 0.01"
                            dur="8s"
                            repeatCount="indefinite"
                        />
                    </feTurbulence>
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="warp"
                        scale="30"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>

                <filter id="liquid-glass-strong">
                    <feTurbulence
                        type="turbulence"
                        baseFrequency="0.05"
                        numOctaves="2"
                        result="warp"
                    >
                        <animate
                            attributeName="baseFrequency"
                            values="0.05; 0.08; 0.05"
                            dur="5s"
                            repeatCount="indefinite"
                        />
                    </feTurbulence>
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="warp"
                        scale="20"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </defs>
        </svg>
    );
}
