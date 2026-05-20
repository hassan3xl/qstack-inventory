"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, DollarSign } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";

const SelectCurrency = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  ];

  const selected = currencies.find((c) => c.code === selectedCurrency);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 hover:bg-accent">
            <span className="font-medium">
              {selected?.code} ({selected?.symbol})
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Select Currency</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {currencies.map((currency) => (
            <DropdownMenuItem
              key={currency.code}
              onClick={() => setSelectedCurrency(currency.code)}
              className="cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">{currency.symbol}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{currency.code}</span>
                  <span className="text-xs text-muted-foreground">
                    {currency.name}
                  </span>
                </div>
              </div>
              {selectedCurrency === currency.code && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
export default SelectCurrency;
