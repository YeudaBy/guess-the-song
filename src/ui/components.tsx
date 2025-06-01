import {motion} from 'framer-motion';
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


export const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center h-20 w-20">
            <motion.div
                className="relative w-16 h-16"
                animate={{rotate: 360}}
                transition={{repeat: Infinity, duration: 1.5, ease: "linear"}}
            >
                <motion.span
                    className="absolute w-4 h-4 bg-tremor-brand rounded-full"
                    style={{top: 0, left: "50%", transform: "translateX(-50%)"}}
                    animate={{scale: [1, 1.5, 1]}}
                    transition={{repeat: Infinity, duration: 1.5, ease: "easeInOut"}}
                />
                <motion.span
                    className="absolute w-4 h-4 bg-tremor-background-emphasis rounded-full"
                    style={{bottom: 0, left: "50%", transform: "translateX(-50%)"}}
                    animate={{scale: [1, 1.5, 1]}}
                    transition={{repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.75}}
                />
            </motion.div>
        </div>
    );
};

export const VolumeSpinner = () => {
    return (
        <div className="flex items-center justify-center h-32 w-32 relative">

            {/*    <motion.div*/}
            {/*        className="absolute w-10 h-2 bg-gray-800 rounded-lg top-6 left-10 origin-left"*/}
            {/*        animate={{ rotate: [0, -15, 0] }}*/}
            {/*        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}*/}
            {/*    />*/}
            {/*</motion.div>*/}

            <motion.div
                animate={{rotate: [25, 15, 25]}}
                transition={{repeat: Infinity, duration: 2, ease: "easeInOut"}}
                className={"flex flex-col justify-center items-center origin-top-right z-10"}>
                <div className={"bg-tremor-background-emphasis size-4 rounded-full"}/>
                <div className={"bg-tremor-background-emphasis w-1.5 h-10"}/>
                <div className={"bg-tremor-background-emphasis w-1.5 h-8 rotate-[32deg] origin-top-right"}/>
            </motion.div>

            <motion.div
                animate={{rotate: 360}}
                transition={{repeat: Infinity, duration: 5, ease: "linear"}}
                className={"size-28 border-4 border-black rounded-full p-3 bg-tremor-border/50"}>
                <div
                    className={"size-20 border-4 border-x-black border-transparent rounded-full flex justify-center items-center"}>
                    <div
                        className={"size-14 border-4 border-x-black border-transparent rounded-full flex justify-center items-center"}>
                        <div className={"size-6 border-4 border-tremor-brand-emphasis rounded-full"}/>
                    </div>
                </div>
            </motion.div>
        </div>
    )
        ;
};

export const DefaultAvatar = ({name}: { name: string }) => {
    // יוצר צבע ייחודי בהתבסס על השם
    const stringToColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str?.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    };

    // מחלץ ראשי תיבות מהשם
    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const bgColor = stringToColor(name);
    const initials = getInitials(name);

    return (
        <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
            style={{backgroundColor: bgColor}}
        >
            {initials}
        </div>
    );
};

export const ColoredAvatar = ({name, imageUrl}: { name: string, imageUrl: string }) => {
    // יוצר צבע רנדומלי מבוסס על השם
    const getRandomHue = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str?.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash % 360; // מחזיר ערך בין 0-360 עבור גוון HSL
    };

    const hue = getRandomHue(name);

    return (
        <div className="relative w-10 h-10">
            <img
                src={imageUrl}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
                style={{
                    filter: `hue-rotate(${hue}deg) saturate(1.5)`
                }}
            />
        </div>
    );
};

export const PrimaryCard = ({children, className}: {
    children: ReactNode,
    className: string
}) => {
    return <div className={"bg-white p-4 rounded-3xl relative border"}>
        {/*<div className={"w-full h-full bg-[#DFD0FF] rotate-[12deg] absolute top-0 right-0 rounded-3xl"}/>*/}
        <motion.div
            initial={{rotate: 0}}
            whileInView={{rotate: 6}}
            viewport={{once: true}}
            transition={{type: "spring", stiffness: 100}}
            className={"w-full h-full right-0 absolute top-0 -z-10 bg-[#50358C]/40 rounded-3xl"}
        />

        <motion.div
            initial={{rotate: 0}}
            whileInView={{rotate: 3}}
            viewport={{once: true}}
            transition={{type: "spring", stiffness: 100}}
            className={"w-full h-full right-0 absolute top-0 -z-10 bg-tremor-brand rounded-3xl"}
        />
        {children}
    </div>
}

export const SecondaryCard = ({children, className}: {
    children: ReactNode,
    className: string
}) => {
    return <div className={"bg-tremor-brand p-4 rounded-3xl relative"}>
        {/*<div className={"w-full h-full bg-[#DFD0FF] rotate-[12deg] absolute top-0 right-0 rounded-3xl"}/>*/}
        <motion.div
            initial={{rotate: 0}}
            whileInView={{rotate: 3}}
            viewport={{once: true}}
            transition={{type: "spring", stiffness: 100}}
            className={"w-full h-full right-0 absolute top-0 -z-10 bg-[#50358C]/40 rounded-3xl"}
        />

        <motion.div
            initial={{rotate: 0}}
            whileInView={{rotate: 6}}
            viewport={{once: true}}
            transition={{type: "spring", stiffness: 100}}
            className={"w-full h-full right-0 absolute top-0 -z-10 bg-tremor-brand/20 rounded-3xl"}
        />
        {children}
    </div>
}

export function Spinner() {
    return <div className="w-5 h-5 border-2 border-t-tremor-brand/50 border-tremor-brand rounded-full animate-spin"/>
}

