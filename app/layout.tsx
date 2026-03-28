import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AventoLinks Scholars Challenge | Compete. Innovate. Win.",
  description:
    "Nigeria's premier secondary school academic competition. Win up to ₦1.5 Million. Free registration for SS1–SS3 students.",
  keywords: ["scholars challenge", "secondary school competition", "Nigeria", "AventoLinks", "academic quiz"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
