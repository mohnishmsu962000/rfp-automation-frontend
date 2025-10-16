import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import Toast from '@/components/ui/Toast';
import QueryProvider from '@/providers/query-provider';

export const metadata: Metadata = {
  title: "RFPGen - AI-Powered RFP Automation",
  description: "Automate RFP responses with AI",
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
          <QueryProvider>
            {children}
            <Toast />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}