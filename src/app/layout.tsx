import type { Metadata, Viewport } from "next";
import { Epilogue, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CartDrawer } from "@/components/cart/CartDrawer";

const epilogue = Epilogue({
  subsets: ["latin"],
  variable: "--font-epilogue",
  display: "swap",
  weight: ["500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Laira Charms • Handcrafted Keepsakes & Clay Keychains",
  description:
    "Artisanal handmade clay keychains, custom phone charms, and bespoke handcrafted keepsakes in Pakistan.",
  keywords: [
    "handmade keychains",
    "clay charms",
    "custom keychains Pakistan",
    "Laira Charms",
    "handcrafted gifts",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Laira Charms • Handcrafted Keepsakes & Clay Keychains",
    description:
      "Artisanal handmade clay keychains, custom phone charms, and bespoke handcrafted keepsakes in Pakistan.",
    siteName: "Laira Charms",
    locale: "en_PK",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFDF8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${epilogue.variable} ${plusJakartaSans.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-body bg-background text-on-surface antialiased min-h-screen flex flex-col selection:bg-strawberry-subtle selection:text-primary">
        <CartProvider>
          <SiteHeader />
          <CartDrawer />
          <main className="flex-1 flex flex-col">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
