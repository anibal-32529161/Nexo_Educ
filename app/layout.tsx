import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexora Edu — Plataforma Educativa",
  description: "Plataforma educativa moderna con seguimiento de resultados en tiempo real.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* Anti-flash: set data-theme before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('nexora-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();` }} />
      </head>
      <body className="min-h-full flex flex-col font-sans" style={{ background: "var(--bg-base)", color: "var(--text-1)", transition: "background 0.35s ease, color 0.35s ease" }}>

        {/* ── Ambient background layer ── */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute inset-0 bg-dot-grid opacity-40" />
          <div className="orb orb-violet w-[600px] h-[600px] -top-40 -left-32 orb-drift" style={{ animationDelay: "0s" }} />
          <div className="orb orb-fuchsia w-[500px] h-[500px] -top-20 right-0 orb-drift" style={{ animationDelay: "4s" }} />
          <div className="orb orb-violet w-[400px] h-[400px] bottom-0 left-1/3 orb-drift" style={{ animationDelay: "8s" }} />
          <div className="star star-1" /><div className="star star-2" /><div className="star star-3" />
          <div className="star star-4" /><div className="star star-5" /><div className="star star-6" />
          <div className="star star-7" /><div className="star star-8" />
        </div>

        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 flex flex-col w-full relative">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
