import type { Metadata } from "next";
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
      </body>
    </html>
  );
}
