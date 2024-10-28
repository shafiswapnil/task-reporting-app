import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "@/app/globals.css";
import { getServerSession } from "next-auth/next";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Task Reporter",
  description: "Task reporting and management system",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
