import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteTitle = "DRY // Portfólio de Adryel Luís Rodrigues";
const siteDescription = "Portfólio jogável de Adryel Luís Rodrigues — estudante de ADS em busca de estágio em Desenvolvimento Full Stack ou Suporte de TI.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  applicationName: "DRY // Portfólio",
  authors: [{ name: "Adryel Luís Rodrigues" }],
  creator: "Adryel Luís Rodrigues",
  keywords: ["Adryel Luís Rodrigues", "portfólio", "desenvolvedor full stack", "suporte de TI", "Análise e Desenvolvimento de Sistemas", "Vale do Paraíba"],
  robots: { index: true, follow: true },
  openGraph: { title: siteTitle, description: siteDescription, siteName: "DRY // Portfólio", locale: "pt_BR", type: "website" },
  twitter: { card: "summary", title: siteTitle, description: siteDescription },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
