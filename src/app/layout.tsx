import type { Metadata, Viewport } from "next";
import { Epilogue, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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
    <html lang="en" className={`${epilogue.variable} ${plusJakartaSans.variable}`}>
      <body className="font-body bg-background text-on-surface antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}

