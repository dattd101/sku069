import type { Metadata } from "next";
import Script from "next/script";
import SessionRedirect from "@/components/SessionRedirect";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movie Links",
  description: "Danh sách link phim từ Facebook, YouTube và TikTok",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionRedirect />
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5LXCH2SC2P"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5LXCH2SC2P');
          `}
        </Script>
      </body>
    </html>
  );
}
