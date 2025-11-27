import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "App Financeiro",
  description: "Gestão Financeira Pessoal e Familiar",
};

import { MonthProvider } from "@/context/MonthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { SearchProvider } from "@/context/SearchContext";
import { SidebarProvider } from "@/context/SidebarContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <SettingsProvider>
          <SearchProvider>
            <MonthProvider>
              <SidebarProvider>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <div className="flex-1 flex flex-col md:ml-0 transition-all duration-300">
                    <Header />
                    <main className="flex-1 p-4 md:p-8 md:ml-64">
                      {children}
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            </MonthProvider>
          </SearchProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
