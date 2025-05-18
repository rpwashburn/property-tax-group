import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { FloatingAdminButton } from '@/components/floating-admin-button';
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/header";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Property Tax Group",
  description: "Property Tax Analysis Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "antialiased relative bg-background"
        )}
      >
        <Header />
        <main className="flex flex-col flex-grow items-center justify-center">
          {children}
        </main>
        <Footer />
        <Toaster richColors />
        <FloatingAdminButton />
      </body>
    </html>
  );
}
