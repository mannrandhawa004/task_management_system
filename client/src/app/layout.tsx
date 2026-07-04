import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

import "./globals.css";

import ReduxProvider from "@/providers/ReduxProvider";
import AuthInitializer from "@/components/AuthInitializer";

import { ThemeProvider } from "next-themes";

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
    >
      <body>
        <ReduxProvider>
          <AuthInitializer />

          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
          </ThemeProvider>

          <Toaster
            position="bottom-center"
            gutter={12}
            containerStyle={{
              bottom: 32,
            }}
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--primary)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "9999px",
                padding: "12px 24px",
                fontSize: "13px",
                fontWeight: "700",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
              },
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
