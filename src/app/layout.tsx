import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../context/Providers";
import { Toaster } from "react-hot-toast";
import Favicon from "/public/favicon.ico";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chee Time Tracker",
  description: "Track and manage your time entries",
  icons: [
    { rel: "icon", url: Favicon.src },
    { rel: "apple-touch-icon", url: "/icons/icon-192.png" },
  ],
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width" as const,
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#2496b9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className={inter.className}>
        <div className="flex items-start justify-center min-h-screen pt-12 pb-24 dark">
          <div className="w-full max-w-7xl inner">
            <Providers>{children}</Providers>
            <Toaster
              toastOptions={{
                position: "bottom-center",
                duration: 1000,
                style: {
                  background: "#18181B",
                  color: "#fff",
                },
                iconTheme: {
                  primary: "#2496b9",
                  secondary: "#fff",
                },
              }}
            />
          </div>
        </div>
      </body>
    </html>
  );
}
