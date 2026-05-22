"use client";

import React, { useMemo } from "react";
import Header from "@/components/Header";
import { useGetSales } from "@/lib/hooks/sales.hook";
import { useGetInventoryStats } from "@/lib/hooks/product.hook";
import Loader from "@/components/Loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNaira } from "@/lib/utils";
import {
  TrendingUp,
  CreditCard,
  Wallet,
  Activity,
  Receipt,
  PieChart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function FinanceClient() {
  const { data: sales, isLoading, isError } = useGetSales();
  const { data: invStats, isLoading: isInvLoading } = useGetInventoryStats();

  const financeStats = useMemo(() => {
    if (!sales || !Array.isArray(sales)) {
      return {
        totalRevenue: 0,
        totalTax: 0,
        totalDiscounts: 0,
        totalNet: 0,
        totalTransactions: 0,
        paymentMethods: {
          cash: 0,
          card: 0,
          bank_transfer: 0,
        },
      };
    }

    let totalRevenue = 0;
    let totalTax = 0;
    let totalDiscounts = 0;
    const paymentMethods = { cash: 0, card: 0, bank_transfer: 0 };

    sales.forEach((sale: any) => {
      totalRevenue += Number(sale.total_amount) || 0;
      totalTax += Number(sale.tax) || 0;
      totalDiscounts += Number(sale.discount) || 0;

      const method = sale.payment_method || "cash";
      if (paymentMethods[method as keyof typeof paymentMethods] !== undefined) {
        paymentMethods[method as keyof typeof paymentMethods] +=
          Number(sale.total_amount) || 0;
      }
    });

    return {
      totalRevenue,
      totalTax,
      totalDiscounts,
      totalNet: totalRevenue - totalTax,
      totalTransactions: sales.length,
      paymentMethods,
    };
  }, [sales]);

  // Mock data for the chart, ideally this should be aggregated by date from the backend
  const chartData = useMemo(() => {
    return [
      { name: "Cash", amount: financeStats.paymentMethods.cash },
      { name: "Card", amount: financeStats.paymentMethods.card },
      { name: "Transfer", amount: financeStats.paymentMethods.bank_transfer },
    ];
  }, [financeStats]);

  if (isError)
    return (
      <div className="p-12 text-center text-red-500">
        Error loading finance data. Please try again.
      </div>
    );

  return (
    <div className="space-y-6 relative">
      {(isLoading || isInvLoading) && (
        <div className="absolute inset-0 z-50 bg-background/50 flex items-center justify-center backdrop-blur-sm rounded-lg min-h-[400px]">
          <Loader title="Loading finance data..." fullscreen={false} />
        </div>
      )}
      <Header
        title="Finance Details"
        subtitle="Overview of store revenue, taxes, and payment methods"
        stats={[
          {
            title: "Total Inventory Value",
            value: formatNaira(invStats?.total_value || 0),
          },
          {
            title: "Total Revenue",
            value: formatNaira(financeStats.totalRevenue),
          },
          {
            title: "Discount Given",
            value: formatNaira(financeStats.totalDiscounts),
          },
          {
            title: "Total Transactions",
            value: financeStats.totalTransactions,
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <Card className="rounded-[2rem] border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" /> Revenue by Payment
              Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Cash Payments</p>
                    <p className="text-xs text-muted-foreground">
                      In-store cash
                    </p>
                  </div>
                </div>
                <span className="font-black text-lg">
                  {formatNaira(financeStats.paymentMethods.cash)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Card Payments</p>
                    <p className="text-xs text-muted-foreground">
                      POS Terminal
                    </p>
                  </div>
                </div>
                <span className="font-black text-lg">
                  {formatNaira(financeStats.paymentMethods.card)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Bank Transfers</p>
                    <p className="text-xs text-muted-foreground">
                      Direct deposit
                    </p>
                  </div>
                </div>
                <span className="font-black text-lg">
                  {formatNaira(financeStats.paymentMethods.bank_transfer)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Chart */}
        <Card className="rounded-[2rem] border-border/50 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" /> Payment Method
              Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fontWeight: 600,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fontWeight: 600,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                  tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.4)" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: any) => [
                    formatNaira(Number(value) || 0),
                    "Revenue",
                  ]}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
