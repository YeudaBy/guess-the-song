import type {Metadata} from "next";
import localFont from "next/font/local";
import "./globals.css";
import {M_PLUS_Rounded_1c} from 'next/font/google'
import ClientLayout from "@/app/ClientLayout";


const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

const mPlusRounded = M_PLUS_Rounded_1c({
    subsets: ["hebrew", "latin-ext"], weight: [
        '100', '300', '400', '500', '700', '800', '900'
    ]
})

export const metadata: Metadata = {
    title: "מי שישמע!",
    description: "Generated by create next app",
    openGraph: {
        title: "מי שישמע! גלו את יכולות זיהוי השירים שלכם והתחרו בחברים",
        type: "website",
        images: [
            {
                secureUrl: "/images/logo-bg-256.png",
                url: "/images/logo-bg-256.png",
            },
            "/images/logo-bg.png"
        ]
    }
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" dir={"rtl"}>
        <body className={`home-page min-h-screen 
        ${mPlusRounded.className} ${geistMono.variable}`}>
        <ClientLayout>
            {children}
        </ClientLayout>
        </body>
        </html>
    );
}
//         // bg-tremor-background bg-secondary-50/5 bg-[url(/images/double-bubble.webp)] bg-blend-multiply backdrop-blur-sm
