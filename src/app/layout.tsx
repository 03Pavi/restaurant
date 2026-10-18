import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.scss";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dinedirect-kappa.vercel.app";

export const viewport: Viewport = {
  themeColor: "#E85D04",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "DineDirect — Digital Dine-in & Direct Ordering Platform",
    template: "%s | DineDirect",
  },
  description:
    "Order direct from local kitchens with zero markups and zero hidden fees. Piping-hot direct express delivery, digital QR dine-in ordering, and contactless restaurant management.",
  keywords: [
    "food delivery",
    "order food direct",
    "zero delivery fees",
    "zero markups",
    "direct restaurant ordering",
    "digital menu QR code",
    "dine-in ordering",
    "contactless dining",
    "local restaurant kitchen",
    "takeaway food",
    "fast express food delivery",
    "Aloo Paratha delivery",
    "Maggi delivery",
    "Crispy Corn delivery",
    "Aloo Poori delivery",
    "online restaurant delivery",
    "restaurant POS kitchen sync",
  ],
  authors: [{ name: "DineDirect Team", url: APP_URL }],
  creator: "DineDirect",
  publisher: "DineDirect",
  applicationName: "DineDirect",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "DineDirect",
    title: "DineDirect — Hot Food. Zero Fees. Order Direct, Cut the Middleman.",
    description:
      "Tired of hidden fees, cold meals, and long delays? Get piping-hot dishes delivered straight from local kitchens to your door with zero markups.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "DineDirect — Direct Digital Ordering & Express Delivery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DineDirect — Hot Food. Zero Fees. Order Direct.",
    description:
      "Order direct from local kitchens with zero markups and zero hidden fees. Piping-hot direct express delivery & live kitchen sync.",
    images: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
