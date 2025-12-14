import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"; // Alias Inter as FontSans
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

import { MonthProvider } from "@/context/MonthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { SearchProvider } from "@/context/SearchContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";

import { cn } from "@/lib/utils"; // Import cn

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "App Financeiro",
  description: "Gerencie suas finanças pessoais", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning><body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}><ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange><SettingsProvider><SearchProvider><MonthProvider><SidebarProvider><div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors"><Sidebar /><div className="flex-1 flex flex-col w-full md:ml-64 transition-all duration-300"><Header /><main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto w-full max-w-full">{children}</main></div></div></SidebarProvider></MonthProvider></SearchProvider></SettingsProvider></ThemeProvider></body></html>
  );
}
