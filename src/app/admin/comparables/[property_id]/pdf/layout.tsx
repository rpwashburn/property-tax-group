import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "PDF Export - FightYourTax.AI",
  description: "PDF export for property tax analysis",
};

export default function PDFLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full bg-white print:bg-white">
      {children}
    </div>
  );
} 