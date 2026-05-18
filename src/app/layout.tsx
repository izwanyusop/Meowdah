import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meowdah.my | Marketplace Kucing Terbaik Malaysia",
  description: "Cari baka kucing premium, makanan kucing, aksesori murah, & khidmat mating terdekat di Malaysia dengan selamat.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Meowdah",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF8C32",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms">
      <body>
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}
