import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enasverse — AI Memory Platform untuk Developer",
  description: "Upload dokumen, tanya kode GitHub, atau delegasikan task ke AI Agent. Enasverse menyimpan memori percakapanmu secara permanen. Powered by Claude AI.",
  keywords: ["AI", "RAG", "Claude AI", "document AI", "AI agent", "Indonesia", "developer tools"],
  openGraph: {
    title: "Enasverse — AI Memory Platform untuk Developer",
    description: "Upload dokumen, tanya kode GitHub, atau delegasikan task ke AI Agent.",
    url: "https://enasverse-x-claude.vercel.app",
    siteName: "Enasverse",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Enasverse — AI Memory Platform",
    description: "AI yang tahu semua konteksmu. Powered by Claude AI.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        {children}
      </body>
    </html>
  );
}
