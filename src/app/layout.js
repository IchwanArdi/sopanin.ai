import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://sopanin.vercel.app"),
  title: {
    default: "Sopanin.ai - Tulis Jujur. Kirim Profesional.",
    template: "%s | Sopanin.ai"
  },
  description: "Tulis jujur. Kirim profesional. Solusi komunikasi profesional untuk Dosen & Atasan. Cepat, Gratis, & Beradab. Dibuat khusus untuk budaya Indonesia.",
  keywords: [
    "komunikasi profesional", "template chat dosen", "etika chat atasan", "bahasa indonesia sopan", 
    "ai indonesia", "sopanin ai", "cara minta izin dosen",
    "professional communication", "indonesian etiquette"
  ],
  authors: [{ name: "Sopanin.ai Team" }],
  creator: "Sopanin.ai",
  publisher: "Sopanin.ai",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Sopanin.ai - Tulis Jujur. Kirim Profesional.",
    description: "Cepat, Gratis, & Beradab. Solusi transformasi chat untuk Dosen dan Atasan.",
    url: "https://sopanin.vercel.app",
    siteName: "Sopanin.ai",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sopanin.ai - Tulis Jujur. Kirim Profesional.",
    description: "Tulis jujur. Kirim profesional. Khusus budaya Indonesia.",
    creator: "@sopanin_ai",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sopanin.ai",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "0XZAjSQb2nurk4wT_NYsLnV8MUKFcm4MmPTqr0Vq4C0",
  },
};

export const viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
