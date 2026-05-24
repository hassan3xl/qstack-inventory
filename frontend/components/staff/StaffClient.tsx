"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Plus, User, Shield, Calendar, Loader2, Trash2, X } from "lucide-react";
import { apiService } from "@/lib/services/apiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/hooks/queryKeys";

export default function StaffClient() {
  const queryClient = useQueryClient();

  // Modals control
  const [isAdding, setIsAdding] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch Staff List
  const { data: staff, isLoading } = useQuery({
    queryKey: QUERY_KEYS.STAFF_LIST,
    queryFn: () => apiService.get("/staff/list/"),
  });

  // Add Staff Mutation
  const addStaffMutation = useMutation({
    mutationFn: (data: any) => apiService.post("/staff/add/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STAFF_LIST });
      toast.success("Staff Added", {
        description: "Login credentials have been provisioned.",
      });
      setIsAdding(false);
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Failed to add staff.";
      toast.error("Error adding staff", { description: errorMsg });
    },
  });

  // Edit Staff Mutation
  const editStaffMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      apiService.patch(`/staff/${userId}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STAFF_LIST });
      toast.success("Staff Updated", {
        description: "Staff role/details updated successfully.",
      });
      setIsEditing(false);
      setSelectedStaff(null);
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Failed to update staff.";
      toast.error("Error updating staff", { description: errorMsg });
    },
  });

  // Remove Staff Mutation
  const removeStaffMutation = useMutation({
    mutationFn: (userId: string) => apiService.delete(`/staff/${userId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STAFF_LIST });
      toast.success("Staff Removed", {
        description: "Staff access has been revoked.",
      });
      setSelectedStaff(null);
      setIsEditing(false);
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Failed to remove staff.";
      toast.error("Error removing staff", { description: errorMsg });
    },
  });

  const handleAddStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    addStaffMutation.mutate(data);
  };

  const handleEditStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStaff) return;
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    editStaffMutation.mutate({ userId: selectedStaff.id, data });
  };

  const handleRemoveStaff = () => {
    if (!selectedStaff) return;
    if (
      confirm(
        `Are you sure you want to remove ${selectedStaff.full_name || selectedStaff.email} from the business?`,
      )
    ) {
      removeStaffMutation.mutate(selectedStaff.id);
    }
  };

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
            className="rounded-lg shadow-lg shadow-primary/20 h-11 px-5 font-bold"
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
            <div className="p-12 text-center text-muted-foreground font-semibold md:col-span-2">
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
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
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
                    className="rounded-lg text-xs font-bold shrink-0 ml-2"
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
          <table className="w-full text-sm text-left">
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
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
                        className="rounded-lg text-xs font-bold"
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

      {/* Add Staff Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card w-full max-w-md rounded-xl border border-border/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black tracking-tight">
                  Add Team Member
                </h3>
                <button
                  onClick={() => setIsAdding(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Provision login credentials and system access to your staff.
              </p>

              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">
                      First Name
                    </label>
                    <input
                      name="first_name"
                      required
                      className="w-full bg-muted/40 border border-border/80 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">
                      Last Name
                    </label>
                    <input
                      name="last_name"
                      required
                      className="w-full bg-muted/40 border border-border/80 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-muted/40 border border-border/80 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">
                    Access Role
                  </label>
                  <select
                    name="role"
                    className="w-full bg-muted/40 border border-border/80 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="staff">Staff Member</option>
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Co-Admin</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 rounded-lg h-11"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addStaffMutation.isPending}
                    className="flex-1 rounded-lg h-11 shadow-lg shadow-primary/10 font-bold"
                  >
                    {addStaffMutation.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Provision Access"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manage/Edit Staff Details Modal */}
      {isEditing && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card w-full max-w-md rounded-xl border border-border/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black tracking-tight">
                  Manage Staff member
                </h3>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedStaff(null);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Update staff metadata role status, or revoke system login
                permission.
              </p>

              <form onSubmit={handleEditStaff} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">
                      First Name
                    </label>
                    <input
                      name="first_name"
                      defaultValue={
                        selectedStaff.full_name?.split(" ")[0] || ""
                      }
                      required
                      className="w-full bg-muted/40 border border-border/80 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">
                      Last Name
                    </label>
                    <input
                      name="last_name"
                      defaultValue={
                        selectedStaff.full_name
                          ?.split(" ")
                          .slice(1)
                          .join(" ") || ""
                      }
                      required
                      className="w-full bg-muted/40 border border-border/80 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">
                    Access Role
                  </label>
                  <select
                    name="role"
                    defaultValue={selectedStaff.role}
                    disabled={selectedStaff.role === "owner"}
                    className="w-full bg-muted/40 border border-border/80 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {selectedStaff.role === "owner" && (
                      <option value="owner">Owner</option>
                    )}
                    <option value="staff">Staff Member</option>
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Co-Admin</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedStaff(null);
                      }}
                      className="flex-1 rounded-lg h-11"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={editStaffMutation.isPending}
                      className="flex-1 rounded-lg h-11 shadow-lg shadow-primary/10 font-bold"
                    >
                      {editStaffMutation.isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                  {selectedStaff.role !== "owner" && (
                    <Button
                      type="button"
                      onClick={handleRemoveStaff}
                      disabled={removeStaffMutation.isPending}
                      className="rounded-lg h-11 w-full font-bold flex items-center justify-center gap-1.5 mt-2"
                    >
                      {removeStaffMutation.isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <>
                          <Trash2 size={16} />
                          Revoke System Access
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
