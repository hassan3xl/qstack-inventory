import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import ModalProvider from "@/providers/ModalProvider";
import Sidebar from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { QueryProvider } from "@/providers/QueryProviders";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Quantum Stack",
  description: "Professional Inventory Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <AuthProvider>
              <ModalProvider>
                <SidebarProvider>
                  <>{children}</>
                  <Toaster richColors position="top-right" closeButton />
                </SidebarProvider>
              </ModalProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
