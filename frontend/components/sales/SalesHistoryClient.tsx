"use client";

import React, { useState, useMemo } from "react";
import { useGetSales } from "@/lib/hooks/sales.hook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNaira } from "@/lib/utils";
import { NormalInput } from "@/components/ui/input";
import {
  Search,
  History,
  Calendar,
  User,
  Printer,
  CheckCircle,
  Tag,
  TrendingUp,
  FileText,
  DollarSign,
  PackageCheck,
} from "lucide-react";

export default function SalesHistoryClient() {
  const { data: sales, isLoading } = useGetSales();
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Selected sale for receipt recall view
  const [selectedSale, setSelectedSale] = useState<any>(null);

  // Stats calculations
  const stats = useMemo(() => {
    if (!sales || !Array.isArray(sales)) {
      return { totalRevenue: 0, totalCount: 0, averageValue: 0 };
    }
    const totalRevenue = sales.reduce(
      (sum, s) => sum + Number(s.total_amount),
      0,
    );
    const totalCount = sales.length;
    const averageValue = totalCount > 0 ? totalRevenue / totalCount : 0;
    return { totalRevenue, totalCount, averageValue };
  }, [sales]);

  // Filtered sales list
  const filteredSales = useMemo(() => {
    if (!sales || !Array.isArray(sales)) return [];
    const query = searchTerm.trim().toLowerCase();
    return sales.filter((s) => {
      const matchesSearch =
        s.sale_number.toLowerCase().includes(query) ||
        (s.cashier_email && s.cashier_email.toLowerCase().includes(query));

      const matchesPayment =
        paymentFilter === "all" || s.payment_method === paymentFilter;

      return matchesSearch && matchesPayment;
    });
  }, [sales, searchTerm, paymentFilter]);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-6 rounded-xl border border-border/50 shadow-sm">
        <div>
          <h1 className="text-xl md:text-3xl font-black tracking-tight flex items-center gap-2">
            <History className="w-8 h-8 text-primary" />
            POS Sales Register History
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Browse and recall past transactions, print duplicates, and monitor
            store turnover.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-lg border-primary/10 shadow-xl shadow-primary/5 p-6 relative group overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                Total Sales Turnover
              </p>
              <h2 className="text-2xl font-black text-foreground mt-1">
                {formatNaira(stats.totalRevenue)}
              </h2>
            </div>
          </div>
        </Card>

        <Card className="rounded-lg border-primary/10 shadow-xl shadow-primary/5 p-6 relative group overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                Total Transactions
              </p>
              <h2 className="text-2xl font-black text-foreground mt-1">
                {stats.totalCount} orders
              </h2>
            </div>
          </div>
        </Card>

        <Card className="rounded-lg border-primary/10 shadow-xl shadow-primary/5 p-6 relative group overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                Average Ticket Value
              </p>
              <h2 className="text-2xl font-black text-foreground mt-1">
                {formatNaira(stats.averageValue)}
              </h2>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Panel */}
      <div className="flex flex-col md:flex-row gap-4 bg-card p-6 rounded-xl border border-border/50 shadow-sm items-stretch md:items-center">
        <div className="flex-1">
          <NormalInput
            type="text"
            icon={Search}
            placeholder="Search by receipt number, cashier email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-4 py-2.5 bg-background border border-input hover:border-ring/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all text-sm font-bold min-w-[180px] h-11"
        >
          <option value="all">All Payment Methods</option>
          <option value="cash">Cash Only</option>
          <option value="card">Card Only</option>
          <option value="bank_transfer">Bank Transfer Only</option>
        </select>
      </div>

      {/* Sales History List Table */}
      <Card className="rounded-xl border-primary/10 shadow-xl shadow-primary/5 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-20 font-bold text-muted-foreground animate-pulse">
              Loading sales registers...
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-20 bg-muted/10">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="font-bold text-muted-foreground text-sm">
                No sales records registered
              </p>
            </div>
          ) : (
            <>
              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden divide-y divide-border/20">
                {filteredSales.map((sale: any) => (
                  <div
                    key={sale.id}
                    className="p-5 flex flex-col gap-3 hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">
                        {sale.sale_number}
                      </span>
                      <span className="capitalize text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">
                        {sale.payment_method.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground font-medium gap-4">
                      <span className="truncate" title={sale.cashier_email}>
                        Cashier: {sale.cashier_email || "System"}
                      </span>
                      <span className="shrink-0">
                        {new Date(sale.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-border/30">
                      <div>
                        <span className="text-[10px] font-black uppercase text-muted-foreground block">
                          Total Amount
                        </span>
                        <span className="font-black text-base text-foreground">
                          {formatNaira(sale.total_amount)}
                        </span>
                      </div>
                      <Button
                        onClick={() => setSelectedSale(sale)}
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-xs font-black cursor-pointer"
                      >
                        View Receipt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                      <th className="px-6 py-4">Receipt Number</th>
                      <th className="px-6 py-4">Cashier</th>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Payment Method</th>
                      <th className="px-6 py-4">Total Amount</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredSales.map((sale: any) => (
                      <tr
                        key={sale.id}
                        className="hover:bg-accent/15 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-sm text-foreground">
                          {sale.sale_number}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                          {sale.cashier_email || "System"}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {new Date(sale.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="capitalize text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">
                            {sale.payment_method.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-sm text-foreground">
                          {formatNaira(sale.total_amount)}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            onClick={() => setSelectedSale(sale)}
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-xs font-black cursor-pointer"
                          >
                            View Receipt
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* POS Receipt Recall Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md rounded-lg overflow-hidden shadow-2xl border border-border/50">
            <div className="bg-primary/5 p-6 border-b border-border/50 text-center relative">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <CardTitle className="text-xl font-black">
                Recall Receipt
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Invoice duplicate viewer
              </p>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Receipt Specs */}
              <div className="space-y-1.5 text-xs border-b border-dashed border-border pb-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Receipt Number:</span>
                  <span className="font-bold text-foreground">
                    {selectedSale.sale_number}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Logged Date:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(selectedSale.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Cashier Identity:</span>
                  <span className="font-semibold text-foreground">
                    {selectedSale.cashier_email || "System"}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Payment Mode:</span>
                  <span className="font-bold capitalize text-primary">
                    {selectedSale.payment_method.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                  Purchased Items
                </span>
                <div className="max-h-[160px] overflow-y-auto divide-y divide-border/20 text-xs">
                  {selectedSale.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="py-2 flex justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-foreground block truncate">
                          {item.product_name}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          {item.quantity} units @ {formatNaira(item.unit_price)}
                        </span>
                      </div>
                      <span className="font-bold text-foreground">
                        {formatNaira(item.total_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal, tax, discounts */}
              <div className="border-t border-border pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatNaira(selectedSale.subtotal)}</span>
                </div>
                {Number(selectedSale.tax) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax VAT</span>
                    <span>+ {formatNaira(selectedSale.tax)}</span>
                  </div>
                )}
                {Number(selectedSale.discount) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>- {formatNaira(selectedSale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-dashed border-border font-black text-sm">
                  <span>Total Amount Paid</span>
                  <span className="text-primary text-base">
                    {formatNaira(selectedSale.total_amount)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="flex-1 rounded-lg h-12 font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer size={16} />
                  Print Copy
                </Button>
                <Button
                  onClick={() => setSelectedSale(null)}
                  className="flex-1 rounded-lg h-12 font-black shadow-lg shadow-primary/10 cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
