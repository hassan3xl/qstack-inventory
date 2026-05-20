import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <div className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-14 mt-6 min-h-[calc(100vh-3.5rem)] ">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
