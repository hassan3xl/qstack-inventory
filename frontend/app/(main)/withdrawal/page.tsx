"use client";

import React, { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  History,
  DollarSign,
  CreditCard,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { motion } from "framer-motion";

const WithdrawalPage = () => {
  const [amount, setAmount] = useState("");

  const transactions = [
    {
      id: "TXN-001",
      date: "Oct 24, 2023",
      amount: 500.0,
      status: "completed",
      method: "Bank Transfer",
    },
    {
      id: "TXN-002",
      date: "Oct 20, 2023",
      amount: 1200.0,
      status: "pending",
      method: "PayPal",
    },
    {
      id: "TXN-003",
      date: "Oct 15, 2023",
      amount: 350.5,
      status: "completed",
      method: "Bank Transfer",
    },
    {
      id: "TXN-004",
      date: "Oct 08, 2023",
      amount: 2100.0,
      status: "failed",
      method: "Bank Transfer",
    },
  ];

  const stats = [
    {
      title: "Available Balance",
      value: "$12,450.00",
      icon: <Wallet className="text-primary w-5 h-5" />,
      desc: "Ready for withdrawal",
    },
    {
      title: "Pending Clearance",
      value: "$3,200.50",
      icon: <Clock className="text-amber-500 w-5 h-5" />,
      desc: "Clearing in 3-5 days",
    },
    {
      title: "Total Withdrawn",
      value: "$45,000.00",
      icon: <ArrowUpRight className="text-emerald-500 w-5 h-5" />,
      desc: "Lifetime earnings",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <Header
        title="Finances & Withdrawals"
        subtitle="Manage your earnings, request withdrawals and track your financial history."
      />

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card p-6 rounded-lg border border-border shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-muted rounded-lg">{stat.icon}</div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {stat.title}
            </p>
            <h3 className="text-2xl font-black mt-1">{stat.value}</h3>
            <p className="text-xs text-muted-foreground mt-2">{stat.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Withdrawal Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-primary text-primary-foreground p-8 rounded-[2.5rem] shadow-2xl shadow-primary/20 relative overflow-hidden"
        >
          {/* Abstract decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-2xl" />

          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Request Payout
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-80 ml-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-5 pl-12 pr-6 text-3xl font-black placeholder:text-white/30 focus:outline-none focus:bg-white/20 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-lg border border-white/10">
                <p className="text-xs opacity-70 mb-2 font-medium">
                  Payout Method
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold">
                      Bank ending in 4242
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 hover:bg-white/20 text-white"
                  >
                    Change
                  </Button>
                </div>
              </div>

              <Button className="w-full py-7 rounded-lg bg-white text-primary hover:bg-white/90 font-black text-lg transition-transform active:scale-95 shadow-xl shadow-black/10">
                Initiate Transfer
              </Button>

              <p className="text-[10px] text-center opacity-60">
                Estimated arrival: 2-3 business days. Min. withdrawal $50.00
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 bg-card rounded-[2.5rem] border border-border shadow-sm flex flex-col"
        >
          <div className="p-8 border-b border-border flex justify-between items-center bg-muted/20">
            <div>
              <h3 className="text-xl font-black flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                History
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg gap-2 font-bold text-xs h-10 border-border"
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/10">
                  <th className="px-8 py-4">Transaction ID</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4 text-right">Amount</th>
                  <th className="px-8 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <p className="font-bold text-sm text-foreground">
                        {txn.id}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {txn.method}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-muted-foreground">
                        {txn.date}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="font-black text-sm">
                        ${txn.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-6 flex justify-center">
                      <span
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          txn.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : txn.status === "pending"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {txn.status === "completed" && (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {txn.status === "pending" && (
                          <Clock className="w-3 h-3" />
                        )}
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 text-center bg-muted/10 border-t border-border/50 rounded-b-[2.5rem]">
            <Button variant="ghost" className="text-xs font-bold text-primary">
              Download Financial Report (.PDF)
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WithdrawalPage;
