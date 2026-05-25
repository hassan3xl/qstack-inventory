"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { useGetCustomers } from "@/lib/hooks/sales.hook";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User, Phone, Mail, Calendar, Activity } from "lucide-react";
import { format } from "date-fns";
import Loader from "@/components/Loader";

export default function CustomersClient() {
  const [searchTerm, setSearchTerm] = useState("");

  // Use debounced search term if needed, or query parameter directly
  const {
    data: customers,
    isLoading,
    isError,
  } = useGetCustomers(searchTerm.length >= 2 ? searchTerm : undefined);

  return (
    <div className="space-y-6">
      <Header
        title="Customers Directory"
        subtitle="Manage and view your store's saved customers"
        stats={[
          { title: "Total Customers", value: customers?.length || 0 },
          { title: "With Email", value: customers?.filter((c: any) => c.email)?.length || 0 }
        ]}
      />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customers by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-muted/40 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-24 flex items-center justify-center">
            <Loader />
          </div>
        ) : isError ? (
          <div className="col-span-full p-12 text-center text-red-500">
            Error loading customers. Please try again.
          </div>
        ) : !customers || customers.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-24 bg-card border border-dashed rounded-xl">
            <User className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <p className="text-lg font-bold text-foreground">
              No customers found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Start serving customers at the POS to add them to your directory.
            </p>
          </div>
        ) : (
          customers.map((customer: any) => (
            <Card
              key={customer.id}
              className="rounded-lg border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-0">
                <div className="bg-primary/5 p-6 flex items-start justify-between border-b border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg shadow-sm">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-foreground tracking-tight">
                        {customer.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                        <Activity className="w-3 h-3 text-emerald-500" /> Active
                        Customer
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4 bg-card">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Phone
                      </p>
                      <p className="font-semibold text-foreground">
                        {customer.phone}
                      </p>
                    </div>
                  </div>

                  {customer.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          Email
                        </p>
                        <p className="font-semibold text-foreground">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Added On
                      </p>
                      <p className="font-semibold text-foreground">
                        {customer.created_at
                          ? format(new Date(customer.created_at), "MMM d, yyyy")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
