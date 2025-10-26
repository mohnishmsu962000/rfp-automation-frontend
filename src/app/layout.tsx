import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import Toast from '@/components/ui/Toast';
import QueryProvider from '@/providers/query-provider';
import { Toaster } from 'react-hot-toast';
import { OrganizationProvider } from '@/providers/OrganizationProvider';

export const metadata: Metadata = {
  title: "ScaleRFP - AI-Powered RFP Automation",
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
            <OrganizationProvider>
              <Toaster position="top-right" />
              {children}
              <Toast />
            </OrganizationProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}