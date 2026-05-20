// layout.tsx - CORRECTED VERSION
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import ModalProvider from "@/providers/ModalProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import Sidebar from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { QueryProvider } from "@/providers/QueryProviders";

export const metadata: Metadata = {
  title: "Qstack Inventory",
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
              <ToastProvider>
                <ModalProvider>
                  <SidebarProvider>
                    <>{children}</>
                  </SidebarProvider>
                </ModalProvider>
              </ToastProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
