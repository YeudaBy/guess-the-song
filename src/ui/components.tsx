import React, {ReactNode} from 'react';

export const Card = ({children, className = ''}: {
    children: ReactNode,
    className?: string
}) => {
    return (
        <div className="relative">
            {/* Shadow Card */}
            <div className="absolute top-2 left-2 w-full h-full bg-primary-700/20 rounded-custom
                      clip-path-polygon transform rotate-3"></div>

            {/* Main Card */}
            <div className={`relative bg-white p-6 rounded-custom shadow-xl clip-path-polygon 
                      border-2 border-primary-200 animate-fade-in ${className}`}>
                {children}
            </div>
        </div>
    );
};

export const Button = ({children, size = "md", variant = 'primary', className = '', disabled = false, ...props}: {
    children: ReactNode,
    className?: string,
    disabled?: boolean,
    size?: "lg" | "md" | "sm"
    variant?: "primary" | "secondary" | "outline"
}) => {
    const variants = {
        primary: 'bg-primary-600 hover:bg-primary-700 text-white',
        secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white',
        outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
    };

    const sizes = {
        "lg": "px-4 py-2 text-lg",
        "md": "px-3 py-1.5 text-md",
        "sm": "px-2 py-1 text-sm"
    }

    return (
        <button disabled={disabled}
                className={`
        rounded-custom font-medium transform transition duration-200
        ${variants[variant]} ${className} ${sizes[size]}
         ${disabled ? "opacity-50 cursor-not-allowed bg-gray-200" :
                    "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"}
      `}
                {...props}
        >
            {children}
        </button>
    );
};

export const Input = ({label, error, ...props}: {
    label: string,
    error: string
}) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                className={`
          w-full px-4 py-2 rounded-custom border
          ${error ? 'border-red-500' : 'border-primary-200'}
          focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200
          transition duration-200
        `}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};
