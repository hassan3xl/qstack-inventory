"use client";

import React, { useEffect, useState } from "react";
import BaseModal from "@/components/modals/BaseModal";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/services/apiService";
import { QUERY_KEYS } from "@/lib/hooks/queryKeys";
import { toast } from "sonner";
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

interface StaffFormValues {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface StaffFormProps {
  isModalOpen: boolean;
  closeModal: () => void;
  selectedStaff?: any; // If provided, edit mode. Otherwise, add mode.
}

const StaffForm: React.FC<StaffFormProps> = ({
  isModalOpen,
  closeModal,
  selectedStaff,
}) => {
  const isEditMode = !!selectedStaff;
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffFormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      role: "cashier",
    },
  });

  // Reset form with appropriate initial values
  useEffect(() => {
    if (isEditMode && selectedStaff) {
      const parts = selectedStaff.full_name?.split(" ") || [];
      reset({
        first_name: parts[0] || "",
        last_name: parts.slice(1).join(" ") || "",
        email: selectedStaff.email || "",
        role: selectedStaff.role || "cashier",
      });
    } else if (!isModalOpen) {
      reset({
        first_name: "",
        last_name: "",
        email: "",
        role: "cashier",
      });
    }
  }, [selectedStaff, isEditMode, isModalOpen, reset]);

  // Add Staff Mutation
  const addStaffMutation = useMutation({
    mutationFn: (data: any) => apiService.post("/staff/add/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STAFF_LIST });
      toast.success("Staff Added", {
        description: "Login credentials have been provisioned.",
      });
      closeModal();
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
      closeModal();
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
      setShowDeleteConfirm(false);
      closeModal();
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Failed to remove staff.";
      toast.error("Error removing staff", { description: errorMsg });
    },
  });

  const onSubmit = (data: StaffFormValues) => {
    if (isEditMode) {
      if (!selectedStaff) return;
      const editPayload = {
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
      };
      editStaffMutation.mutate({ userId: selectedStaff.id, data: editPayload });
    } else {
      addStaffMutation.mutate(data);
    }
  };

  const handleRemoveStaff = () => {
    if (!selectedStaff) return;
    removeStaffMutation.mutate(selectedStaff.id);
  };

  const isPending = isEditMode ? editStaffMutation.isPending : addStaffMutation.isPending;

  return (
    <>
      <BaseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditMode ? "Manage Staff Member" : "Add Team Member"}
        description={
          isEditMode
            ? "Update staff metadata, role status, or revoke system login permission."
            : "Provision login credentials and system access to your staff."
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="first_name"
              label="First Name"
              register={register}
              error={errors.first_name}
              validation={{ required: "First name is required" }}
              placeholder="John"
            />
            <Input
              name="last_name"
              label="Last Name"
              register={register}
              error={errors.last_name}
              validation={{ required: "Last name is required" }}
              placeholder="Doe"
            />
          </div>

          <Input
            name="email"
            type="email"
            label="Email Address"
            register={register}
            error={errors.email}
            disabled={isEditMode}
            validation={{ required: "Email address is required" }}
            placeholder="john.doe@qstack.com"
          />

          <Input
            name="role"
            label="Access Role"
            field="select"
            register={register}
            error={errors.role}
            disabled={selectedStaff?.role === "owner"}
            options={[
              ...(selectedStaff?.role === "owner"
                ? [{ value: "owner", label: "Owner" }]
                : []),
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
                onClick={closeModal}
                className="flex-1 rounded-lg h-11 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-lg h-11 shadow-lg shadow-primary/10 font-bold cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="animate-spin mr-1.5" />
                ) : isEditMode ? (
                  "Save Changes"
                ) : (
                  "Provision Access"
                )}
              </Button>
            </div>

            {isEditMode && selectedStaff?.role !== "owner" && (
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
      </BaseModal>

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
            <AlertDialogCancel
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-lg h-12 px-6 font-bold border-border cursor-pointer"
            >
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
    </>
  );
};

export default StaffForm;