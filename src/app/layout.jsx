// app/layout.jsx
import Layout from "@/components/molecules/Layout";
import "./globals.css";
import { Almarai } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "@/context/NotificationContext";
import NotificationPopup from "@/components/Notifications/NotificationPopup";
import NotificationToast from "@/components/Notifications/NotificationToast";

// ✅ Font
export const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  display: "swap",
  // variable: "--font-almarai", // (اختياري) لو تحب تستخدم CSS variable
});

// ✅ Site constants
const siteName = "وايت مياة";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const defaultTitle = "وايت مياة | مياه نقية وتوصيل سريع";
const defaultDescription =
  "وايت مياة: مياه نقية وصحية مع خدمة توصيل سريعة. مقالات ونصائح عن الصحة والمياه، وخدمات للسائقين والتعاقدات وإدارة الحساب.";

// ✅ Next.js Metadata (App Router)
export const metadata = {
  // مهم جداً علشان روابط OG تطلع كاملة
  metadataBase: new URL(siteUrl),

  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },

  description: defaultDescription,

  applicationName: siteName,

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "ar_AR",
    url: siteUrl,
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: "/water.png",
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/og.png"],
  },

  icons: {
    icon: [{ url: "/water.png" }, { url: "/water.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  keywords: [
    "وايت مياة",
    "مياه",
    "توصيل مياه",
    "مياه شرب",
    "نصائح صحية",
    "تحلية المياه",
    "مقالات المياه",
    "التعاقدات",
    "السائقين",
  ],
 
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={almarai.className}>
        <NotificationProvider>
     <Layout>{children}</Layout>
        <NotificationPopup />

				<Toaster  position="top-center" />
        <NotificationToast />
        </NotificationProvider>
   
      </body>
    </html>
  );
}
