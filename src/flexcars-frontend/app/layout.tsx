"use client";

import { Geist, Geist_Mono } from "next/font/google";
import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';

import { AuthProvider } from "@/context/authContext";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient()

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <AuthProvider>
            <main>{children}</main>
          </AuthProvider>
        </MantineProvider>
      </QueryClientProvider>
      </body>
    </html>
  );
}
