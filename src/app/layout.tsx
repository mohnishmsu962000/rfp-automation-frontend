import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import Toast from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: "RFP Automation Platform",
  description: "AI-powered RFP response generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
          <Toast />
        </body>
      </html>
    </ClerkProvider>
  );
}