"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  addToast,
} from "@heroui/react";
import { userApi } from "@/lib/supabase/client";
import { User, Phone, FileText, Percent, MapPin } from "lucide-react";

export default function UserForm({
  isOpen,
  onOpenChange,
  user = null,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    personal_address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
    },
    note: "",
    equity_percentage: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        phone_number: user.phone_number || "",
        personal_address: user.personal_address || {
          street: "",
          city: "",
          state: "",
          country: "",
          postal_code: "",
        },
        note: user.note || "",
        equity_percentage: user.equity_percentage?.toString() || "",
      });
    } else {
      // Reset form when not in edit mode
      setFormData({
        full_name: "",
        phone_number: "",
        personal_address: {
          street: "",
          city: "",
          state: "",
          country: "",
          postal_code: "",
        },
        note: "",
        equity_percentage: "",
      });
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for nested personal_address
    if (name.startsWith("personal_address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        personal_address: {
          ...prev.personal_address,
          [addressField]: value,
        },
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate inputs
      if (!formData.full_name.trim()) {
        setError("Full name is required");
        setIsLoading(false);
        return;
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        equity_percentage: formData.equity_percentage
          ? parseFloat(formData.equity_percentage)
          : null,
      };

      // Submit the user profile
      await userApi.upsertUserProfile(submitData);

      // Close modal and trigger success callback
      onOpenChange(false);
      onSuccess();

      // Show success toast
      addToast({
        title: isEditMode ? "User Updated" : "User Created",
        description: isEditMode
          ? "User profile has been successfully updated."
          : "A new user profile has been added.",
        color: "success",
        variant: "flat",
        radius: "md",
        icon: "success",
      });
    } catch (err) {
      console.error("Error saving user profile:", err);
      setError(err.message || "Failed to save user profile");

      // Show error toast
      addToast({
        title: "Failed to Save User",
        description: err.message || "An unexpected error occurred",
        color: "danger",
        variant: "flat",
        radius: "md",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          {isEditMode ? "Edit User Profile" : "Add New User"}
        </ModalHeader>
        <ModalBody>
          {error && (
            <div className="mb-4 p-3 bg-danger-50 text-danger rounded-lg">
              {error}
            </div>
          )}

          <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="full_name"
              label="Full Name"
              placeholder="Enter full name"
              value={formData.full_name}
              onChange={handleChange}
              startContent={<User size={16} className="text-default-400" />}
              isRequired
            />

            <Input
              name="phone_number"
              label="Phone Number"
              placeholder="Enter phone number"
              value={formData.phone_number}
              onChange={handleChange}
              startContent={<Phone size={16} className="text-default-400" />}
            />

            <Input
              name="equity_percentage"
              label="Equity Percentage"
              placeholder="0.00"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.equity_percentage}
              onChange={handleChange}
              startContent={<Percent size={16} className="text-default-400" />}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="personal_address.street"
                label="Street"
                placeholder="Street address"
                value={formData.personal_address.street}
                onChange={handleChange}
                startContent={<MapPin size={16} className="text-default-400" />}
              />
              <Input
                name="personal_address.city"
                label="City"
                placeholder="City"
                value={formData.personal_address.city}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="personal_address.state"
                label="State/Province"
                placeholder="State"
                value={formData.personal_address.state}
                onChange={handleChange}
              />
              <Input
                name="personal_address.country"
                label="Country"
                placeholder="Country"
                value={formData.personal_address.country}
                onChange={handleChange}
              />
            </div>

            <Input
              name="personal_address.postal_code"
              label="Postal Code"
              placeholder="Postal code"
              value={formData.personal_address.postal_code}
              onChange={handleChange}
            />

            <Textarea
              name="note"
              label="Notes"
              placeholder="Additional notes about the user"
              value={formData.note}
              onChange={handleChange}
              startContent={<FileText size={16} className="text-default-400" />}
              minRows={3}
              maxRows={6}
            />
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            type="submit"
            form="user-form"
            isLoading={isLoading}
          >
            {isEditMode ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
