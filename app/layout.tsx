import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const SITE_URL = "https://mcg-global.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MCG Global — Your Complete Trade & Logistics Ecosystem",
    template: "%s | MCG Global",
  },
  description:
    "Import from China made easy. Connect with trusted suppliers, warehouses, drivers and logistics services in one powerful platform.",
  keywords: [
    "import from china",
    "B2B marketplace",
    "logistics platform",
    "trade ecosystem",
    "suppliers directory",
    "warehouse solutions",
    "freight transport",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "MCG Global — Your Complete Trade & Logistics Ecosystem",
    description:
      "Connect with trusted suppliers, warehouses, drivers and logistics services in one powerful platform.",
    siteName: "MCG Global",
  },
  twitter: {
    card: "summary_large_image",
    title: "MCG Global — Your Complete Trade & Logistics Ecosystem",
    description:
      "Connect with trusted suppliers, warehouses, drivers and logistics services in one powerful platform.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // lang/dir are kept here so future i18n can swap to "ar" + dir="rtl".
  return (
    <html lang="en" dir="ltr" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
