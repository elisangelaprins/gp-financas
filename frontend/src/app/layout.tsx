import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GP Finanças — Gestão Financeira Pessoal",
  description: "Controle de receitas, despesas, orçamentos por categoria e relatórios analíticos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <Toaster richColors position="top-right" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
