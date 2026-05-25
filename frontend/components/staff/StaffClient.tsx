"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Plus, User, Shield, Calendar, Loader2, Trash2, X } from "lucide-react";
import { apiService } from "@/lib/services/apiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/hooks/queryKeys";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AddStaffValues {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface EditStaffValues {
  first_name: string;
  last_name: string;
  role: string;
}

export default function StaffClient() {
  const queryClient = useQueryClient();

  // Modals control
  const [isAdding, setIsAdding] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch Staff List
  const { data: staff, isLoading } = useQuery({
    queryKey: QUERY_KEYS.STAFF_LIST,
    queryFn: () => apiService.get("/staff/list/"),
    staleTime: 1000 * 60 * 5,
  });

  const addForm = useForm<AddStaffValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      role: "staff",
    },
  });

  const editForm = useForm<EditStaffValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      role: "staff",
    },
  });

  // Preload staff metadata when opening edit modal
  React.useEffect(() => {
    if (selectedStaff) {
      editForm.reset({
        first_name: selectedStaff.full_name?.split(" ")[0] || "",
        last_name: selectedStaff.full_name?.split(" ").slice(1).join(" ") || "",
        role: selectedStaff.role || "staff",
      });
    }
  }, [selectedStaff, editForm]);

  // Add Staff Mutation
  const addStaffMutation = useMutation({
    mutationFn: (data: any) => apiService.post("/staff/add/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STAFF_LIST });
      toast.success("Staff Added", {
        description: "Login credentials have been provisioned.",
      });
      setIsAdding(false);
      addForm.reset();
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
      setShowDeleteConfirm(false);
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Failed to remove staff.";
      toast.error("Error removing staff", { description: errorMsg });
    },
  });

  const onAddSubmit = (data: AddStaffValues) => {
    addStaffMutation.mutate(data);
  };

  const onEditSubmit = (data: EditStaffValues) => {
    if (!selectedStaff) return;
    editStaffMutation.mutate({ userId: selectedStaff.id, data });
  };

  const handleRemoveStaff = () => {
    if (!selectedStaff) return;
    removeStaffMutation.mutate(selectedStaff.id);
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
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Provision login credentials and system access to your staff.
              </p>

              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="first_name"
                    label="First Name"
                    register={addForm.register}
                    error={addForm.formState.errors.first_name}
                    validation={{ required: "First name is required" }}
                    placeholder="John"
                  />
                  <Input
                    name="last_name"
                    label="Last Name"
                    register={addForm.register}
                    error={addForm.formState.errors.last_name}
                    validation={{ required: "Last name is required" }}
                    placeholder="Doe"
                  />
                </div>

                <Input
                  name="email"
                  type="email"
                  label="Email Address"
                  register={addForm.register}
                  error={addForm.formState.errors.email}
                  validation={{ required: "Email address is required" }}
                  placeholder="john.doe@qstack.com"
                />

                <Input
                  name="role"
                  label="Access Role"
                  field="select"
                  register={addForm.register}
                  error={addForm.formState.errors.role}
                  options={[
                    { value: "staff", label: "Staff Member" },
                    { value: "cashier", label: "Cashier" },
                    { value: "manager", label: "Manager" },
                    { value: "admin", label: "Co-Admin" },
                  ]}
                />

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/30">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 rounded-lg h-11 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addStaffMutation.isPending}
                    className="flex-1 rounded-lg h-11 shadow-lg shadow-primary/10 font-bold cursor-pointer"
                  >
                    {addStaffMutation.isPending ? (
                      <Loader2 className="animate-spin mr-1.5" />
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
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Update staff metadata role status, or revoke system login
                permission.
              </p>

              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="first_name"
                    label="First Name"
                    register={editForm.register}
                    error={editForm.formState.errors.first_name}
                    validation={{ required: "First name is required" }}
                    placeholder="John"
                  />
                  <Input
                    name="last_name"
                    label="Last Name"
                    register={editForm.register}
                    error={editForm.formState.errors.last_name}
                    validation={{ required: "Last name is required" }}
                    placeholder="Doe"
                  />
                </div>

                <Input
                  name="role"
                  label="Access Role"
                  field="select"
                  register={editForm.register}
                  error={editForm.formState.errors.role}
                  disabled={selectedStaff.role === "owner"}
                  options={[
                    ...(selectedStaff.role === "owner"
                      ? [{ value: "owner", label: "Owner" }]
                      : []),
                    { value: "staff", label: "Staff Member" },
                    { value: "cashier", label: "Cashier" },
                    { value: "manager", label: "Manager" },
                    { value: "admin", label: "Co-Admin" },
                  ]}
                />

                <div className="flex flex-col gap-2 pt-4 border-t border-border/30">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedStaff(null);
                      }}
                      className="flex-1 rounded-lg h-11 cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={editStaffMutation.isPending}
                      className="flex-1 rounded-lg h-11 shadow-lg shadow-primary/10 font-bold cursor-pointer"
                    >
                      {editStaffMutation.isPending ? (
                        <Loader2 className="animate-spin mr-1.5" />
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                  {selectedStaff.role !== "owner" && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={removeStaffMutation.isPending}
                      className="rounded-lg h-11 w-full font-bold flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
                    >
                      {removeStaffMutation.isPending ? (
                        <Loader2 className="animate-spin mr-1.5" />
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

      {/* Revocation Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-lg p-8 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">
              Revoke System Access
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              Are you sure you want to remove this staff member? This will revoke all access privileges to the platform.
              {selectedStaff && (
                <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100 font-bold text-red-700">
                  {selectedStaff.full_name || selectedStaff.email}
                </div>
              )}
              This operation is final and will log the revocation event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} className="rounded-lg h-12 px-6 font-bold border-border cursor-pointer">
              Cancel Action
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStaff}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-12 px-6 font-black cursor-pointer"
            >
              Confirm Revocation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
