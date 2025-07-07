"use client";

import NavbarSegmented from "./navBarSegmented";

export default function AuthedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavbarSegmented>
      {children}
    </NavbarSegmented>
  );
}
