import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/components/theme/ThemeRegistry";

export const metadata: Metadata = {
  title: "Smile more Clinic",
  description: "App for Dr. Anastasiya Feldman",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
