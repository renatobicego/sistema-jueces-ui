import type { Metadata } from "next";
import { Toast } from "@heroui/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema Jueces AMA",
  description: "Sistema de carga de resultados para torneos de atletismo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="light">
      <body className="bg-background min-h-screen font-sans antialiased">
        <Toast.Provider placement="bottom end" />
        {children}
      </body>
    </html>
  );
}
