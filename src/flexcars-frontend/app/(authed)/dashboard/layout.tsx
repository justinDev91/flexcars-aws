"use client";

import NavbarSegmented from "./navBarSegmented";

export default function AuthedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavbarSegmented>
      <main className="px-4 w-full">
        {children}
      </main>
    </NavbarSegmented>
  );
}
