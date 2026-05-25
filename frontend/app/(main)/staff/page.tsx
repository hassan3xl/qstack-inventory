"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Plus, User, Shield, Calendar } from "lucide-react";
import { apiService } from "@/lib/services/apiService";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/hooks/queryKeys";
import StaffForm from "@/components/forms/StaffForm";

export default function StaffClient() {
  // Modals control
  const [isAdding, setIsAdding] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch Staff List
  const { data: staff, isLoading } = useQuery({
    queryKey: QUERY_KEYS.STAFF_LIST,
    queryFn: () => apiService.get("/staff/list/"),
    staleTime: 1000 * 60 * 5,
  });

  const totalStaff = staff?.length || 0;
  const adminCount =
    staff?.filter((s: any) => s.role === "admin" || s.role === "owner")
      .length || 0;
  const managerCount =
    staff?.filter((s: any) => s.role === "manager").length || 0;
  const cashierCount =
    staff?.filter((s: any) => s.role === "cashier").length || 0;

  return (
    <div className="space-y-8 pb-12">
      <Header
        title="Staff Management"
        subtitle="Manage your team members, cashiers, managers, and access permissions."
        stats={[
          { title: "Total Staff", value: String(totalStaff) },
          { title: "Admins/Owners", value: String(adminCount) },
          { title: "Managers", value: String(managerCount) },
          { title: "Cashiers", value: String(cashierCount) },
        ]}
        actions={
          <Button
            onClick={() => setIsAdding(true)}
            className="rounded-lg shadow-lg shadow-primary/20 h-11 px-5 font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Staff
          </Button>
        }
      />

      {/* Staff Display */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
        {/* Mobile/Tablet Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4 p-4">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground font-semibold md:col-span-2 animate-pulse">
              Loading staff...
            </div>
          ) : staff?.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground font-semibold md:col-span-2">
              No staff found.
            </div>
          ) : (
            staff?.map((member: any) => (
              <div
                key={member.id}
                className="border border-border/50 rounded-xl p-5 bg-muted/20 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">
                        {member.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedStaff(member);
                      setIsEditing(true);
                    }}
                    className="rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Manage
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      member.role === "owner"
                        ? "bg-amber-500/10 text-amber-600"
                        : member.role === "admin"
                          ? "bg-purple-500/10 text-purple-600"
                          : member.role === "manager"
                            ? "bg-indigo-500/10 text-indigo-600"
                            : member.role === "cashier"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-blue-500/10 text-blue-600"
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    {member.role_display}
                  </span>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(member.date_joined).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border/50 text-[10px] uppercase font-black tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-muted-foreground font-semibold"
                  >
                    Loading staff...
                  </td>
                </tr>
              ) : staff?.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-muted-foreground font-semibold"
                  >
                    No staff found.
                  </td>
                </tr>
              ) : (
                staff?.map((member: any) => (
                  <tr
                    key={member.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-6 py-4 max-w-[300px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">
                            {member.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          member.role === "owner"
                            ? "bg-amber-500/10 text-amber-600"
                            : member.role === "admin"
                              ? "bg-purple-500/10 text-purple-600"
                              : member.role === "manager"
                                ? "bg-indigo-500/10 text-indigo-600"
                                : member.role === "cashier"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-blue-500/10 text-blue-600"
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {member.role_display}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(member.date_joined).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStaff(member);
                          setIsEditing(true);
                        }}
                        className="rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified Staff Form for creation */}
      <StaffForm
        isModalOpen={isAdding}
        closeModal={() => setIsAdding(false)}
      />

      {/* Unified Staff Form for editing */}
      <StaffForm
        isModalOpen={isEditing}
        closeModal={() => {
          setIsEditing(false);
          setSelectedStaff(null);
        }}
        selectedStaff={selectedStaff}
      />
    </div>
  );
}
