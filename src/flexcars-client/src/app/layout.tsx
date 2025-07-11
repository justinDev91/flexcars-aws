import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { CookieProvider } from "@/context/cookie-context";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/cookie-banner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlexCars - Location de véhicules",
  description: "Plateforme de location de véhicules flexibles et modernes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <CookieProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <CookieBanner />
          </AuthProvider>
        </CookieProvider>
      </body>
    </html>
  );
}
