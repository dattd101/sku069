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
    <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-5LXCH2SC2P"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-5LXCH2SC2P');
</script>
      <body suppressHydrationWarning>
        <SessionRedirect />
        {children}
      </body>
    </html>
  );
}
