import type {Config} from "tailwindcss";
import formsPlugin from "@tailwindcss/forms";

const config: Config = {
    darkMode: ["class", "class"],
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
    	transparent: 'transparent',
    	current: 'currentColor',
    	extend: {
    		colors: {
    			tremor: {
    				brand: {
    					faint: '#1e1b2f',
    					muted: '#5b5f97',
    					subtle: '#7a8dff',
    					DEFAULT: '#8be9fd',
    					emphasis: '#a78bfa',
    					inverted: '#1e1b2f'
    				},
    				background: {
    					muted: '#1a1a2e',
    					subtle: '#141423',
    					DEFAULT: '#0a0a14',
    					emphasis: '#2d1b57'
    				},
    				border: {
    					DEFAULT: '#7a8dff'
    				},
    				ring: {
    					DEFAULT: '#8be9fd'
    				},
    				content: {
    					subtle: '#7a8dff',
    					DEFAULT: '#e2e8f0',
    					emphasis: '#8be9fd',
    					strong: '#a78bfa',
    					inverted: '#0a0a14'
    				}
    			},
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		boxShadow: {
    			custom: '0 4px 6px -1px rgba(124, 58, 237, 0.1), 0 2px 4px -2px rgba(124, 58, 237, 0.1)',
    			'tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    			'tremor-card': '0 4px 6px -1px rgba(124, 58, 237, 0.1), 0 2px 4px -2px rgba(124, 58, 237, 0.1)',
    			'tremor-dropdown': '0 4px 6px -1px rgba(124, 58, 237, 0.1), 0 2px 4px -2px rgba(124, 58, 237, 0.1)'
    		},
    		borderRadius: {
    			custom: '0.5rem',
    			'tremor-small': '0.375rem',
    			'tremor-default': '0.5rem',
    			'tremor-full': '9999px',
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		fontSize: {
    			'tremor-label': [
    				'0.75rem',
    				{
    					lineHeight: '1rem'
    				}
    			],
    			'tremor-default': [
    				'0.875rem',
    				{
    					lineHeight: '1.25rem'
    				}
    			],
    			'tremor-title': [
    				'1.125rem',
    				{
    					lineHeight: '1.75rem'
    				}
    			],
    			'tremor-metric': [
    				'1.875rem',
    				{
    					lineHeight: '2.25rem'
    				}
    			]
    		},
    		animation: {
    			'slide-up': 'slideUp 0.3s ease-out',
    			'fade-in': 'fadeIn 0.2s ease-in'
    		},
    		keyframes: {
    			slideUp: {
    				'0%': {
    					transform: 'translateY(10px)',
    					opacity: '0'
    				},
    				'100%': {
    					transform: 'translateY(0)',
    					opacity: '1'
    				}
    			},
    			fadeIn: {
    				'0%': {
    					opacity: '0'
    				},
    				'100%': {
    					opacity: '1'
    				}
    			}
    		},
    		clipPath: {
    			card: 'polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)'
    		}
    	}
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
    plugins: [formsPlugin, require("tailwindcss-animate")],
};

export default config;
