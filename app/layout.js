

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./_components/Header";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Smart Form AI",
  description: "Generate Forms easily",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>

    <html lang="en" data-theme="light" >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <Header/>
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
