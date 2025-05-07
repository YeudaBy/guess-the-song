import type {Config} from "tailwindcss";
import colors from "tailwindcss/colors";
import formsPlugin from "@tailwindcss/forms";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        transparent: "transparent",
        current: "currentColor",
        extend: {
            colors: {
                // Custom theme colors
                primary: {
                    50:  '#fdf3ff',
                    100: '#fae8ff',
                    200: '#f3c7fd',
                    300: '#e89afb',
                    400: '#da63f4',
                    500: '#c30ad8', // base
                    600: '#a008b3',
                    700: '#830893',
                    800: '#65096e',
                    900: '#4e0755',
                },
                secondary: {
                    50: '#f0fcff',
                    100: '#d9f6ff',
                    200: '#b3ecff',
                    300: '#8de1ff',
                    400: '#75e6ff', // base
                    500: '#38cfff',
                    600: '#1ab8e6',
                    700: '#1093b3',
                    800: '#0e6d80',
                    900: '#0a4d5c',
                },
                // Tremor light mode
                tremor: {
                    brand: {
                        faint: "#f5f3ff",  // primary-50
                        muted: "#c4b5fd",  // primary-300
                        subtle: "#ddd6fe", // primary-200
                        DEFAULT: "#8b5cf6", // primary-500
                        emphasis: "#6d28d9", // primary-700
                        inverted: colors.white,
                    },
                    background: {
                        muted: colors.white,
                        subtle: "#f5f3ff", // primary-50
                        DEFAULT: "#ffffff",
                        emphasis: "#4c1d95", // primary-900
                    },
                    border: {
                        DEFAULT: "#ddd6fe", // primary-200
                    },
                    ring: {
                        DEFAULT: "#ddd6fe", // primary-200
                    },
                    content: {
                        subtle: "#a78bfa", // primary-400
                        DEFAULT: "#7c3aed", // primary-600
                        emphasis: "#5b21b6", // primary-800
                        strong: "#4c1d95", // primary-900
                        inverted: colors.white,
                    },
                },
            },
            boxShadow: {
                // Custom shadows
                'custom': '0 4px 6px -1px rgba(124, 58, 237, 0.1), 0 2px 4px -2px rgba(124, 58, 237, 0.1)',
                // Tremor shadows
                "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                "tremor-card": "0 4px 6px -1px rgba(124, 58, 237, 0.1), 0 2px 4px -2px rgba(124, 58, 237, 0.1)",
                "tremor-dropdown": "0 4px 6px -1px rgba(124, 58, 237, 0.1), 0 2px 4px -2px rgba(124, 58, 237, 0.1)",
            },
            borderRadius: {
                // Custom border radius
                'custom': '0.5rem',
                // Tremor border radius
                "tremor-small": "0.375rem",
                "tremor-default": "0.5rem", // Changed to match our theme
                "tremor-full": "9999px",
            },
            fontSize: {
                // Tremor font sizes
                "tremor-label": ["0.75rem", {lineHeight: "1rem"}],
                "tremor-default": ["0.875rem", {lineHeight: "1.25rem"}],
                "tremor-title": ["1.125rem", {lineHeight: "1.75rem"}],
                "tremor-metric": ["1.875rem", {lineHeight: "2.25rem"}],
            },
            animation: {
                'slide-up': 'slideUp 0.3s ease-out',
                'fade-in': 'fadeIn 0.2s ease-in',
            },
            keyframes: {
                slideUp: {
                    '0%': {transform: 'translateY(10px)', opacity: '0'},
                    '100%': {transform: 'translateY(0)', opacity: '1'},
                },
                fadeIn: {
                    '0%': {opacity: '0'},
                    '100%': {opacity: '1'},
                },
            },
            clipPath: {
                'card': 'polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)',
            },
        },
    },
    safelist: [
        {
            pattern:
                /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
            variants: ["hover", "data-[selected]"],
        },
        {
            pattern:
                /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
            variants: ["hover", "data-[selected]"],
        },
        {
            pattern:
                /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
            variants: ["hover", "data-[selected]"],
        },
        {
            pattern:
                /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
        },
        {
            pattern:
                /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
        },
        {
            pattern:
                /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
        },
        // Add safelist for our custom colors
        {
            pattern: /^(bg|text|border|ring)-primary-(50|100|200|300|400|500|600|700|800|900)$/,
            variants: ["hover", "focus", "active", "data-[selected]"],
        },
        {
            pattern: /^(bg|text|border|ring)-secondary-(50|100|200|300|400|500|600|700|800|900)$/,
            variants: ["hover", "focus", "active", "data-[selected]"],
        },
    ],
    plugins: [formsPlugin],
};

export default config;
