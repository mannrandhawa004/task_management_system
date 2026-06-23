import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import ReduxProvider from "@/providers/ReduxProvider";
import AuthInitializer from "@/components/AuthInitializer";

import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "Task Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`
                ${geistSans.variable}
                ${geistMono.variable}
            `}
    >
      <body>
        <ReduxProvider>
          <AuthInitializer />

          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
          </ThemeProvider>

          <Toaster
            position="top-right"
            gutter={12}
            containerStyle={{
              top: 20,
              right: 20,
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
