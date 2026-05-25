"use client";
import { Button } from "../ui/button";
import { Menu, Search, Package, X } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { AccountDropdown } from "./AccountDropdown";
import { useBusinessConfig } from "@/lib/hooks/useBusinessConfig";
import Link from "next/link";
import Image from "next/image";
import NotificationButton from "./NotificationButton";

export function Navbar() {
  const { toggleSidebar, closeSidebar, isOpen } = useSidebar();
  const { config, storeInfo } = useBusinessConfig();
  console.log("config", config);
  console.log("storeInfo", storeInfo);

  return (
    <nav className="bg-muted border-b border-border fixed top-0 left-0 right-0 z-50">
      <div className="w-full">
        <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
          {/* LEFT - Logo & Menu */}
          <div className="flex items-center gap-4">
            {isOpen && (
              <Button
                onClick={closeSidebar}
                size="icon"
                className="lg:hidden"
                aria-label="Toggle sidebar"
              >
                <X size={24} />
              </Button>
            )}
            {!isOpen && (
              <Button
                onClick={toggleSidebar}
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Toggle sidebar"
              >
                <Menu size={24} />
              </Button>
            )}

            <Link href="/" className="flex items-center gap-2">
              {storeInfo?.logo ? (
                <div className="relative w-8 h-8 rounded-md overflow-hidden border border-border shadow-xs">
                  <Image
                    src={storeInfo.logo}
                    alt={storeInfo.name || "Store Logo"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <Package className="text-primary h-7 w-7" />
              )}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <h1 className="text-xl capitalize font-black text-foreground hidden sm:block tracking-tighter">
                  {storeInfo?.name} Inventory
                </h1>
                {storeInfo?.business_type && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20 scale-95 origin-left shrink-0">
                    {config.displayName}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* RIGHT - Account & System */}
          <div className="flex items-center gap-3">
            <NotificationButton />
            <div className="h-6 w-px bg-border mx-1" />
            <AccountDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
}
