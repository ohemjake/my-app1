"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  console.log("RootLayout is rendering with SessionProvider");
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}



