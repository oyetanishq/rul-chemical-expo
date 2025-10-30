import type { Metadata } from "next";
import { Ubuntu_Mono } from "next/font/google";
import "./globals.css";

const ubuntuMono = Ubuntu_Mono({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-ubuntu-mono",
});

export const metadata: Metadata = {
    title: "RUL Prediction",
    description: "Battery remaining useful life prediction",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${ubuntuMono.className}`}>{children}</body>
        </html>
    );
}
