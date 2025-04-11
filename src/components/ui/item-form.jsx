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
  addToast,
} from "@heroui/react";
import { itemApi } from "@/lib/supabase/client";
import { Tag, AlignLeft } from "lucide-react";

export default function ItemForm({
  isOpen,
  onOpenChange,
  item = null,
  onSuccess,
  suppressSuccessToast = false, // Added to match expense form pattern
}) {
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!item;

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        abbreviation: item.abbreviation || "",
      });
    } else {
      // Reset form when not in edit mode
      setFormData({
        name: "",
        abbreviation: "",
      });
    }
  }, [item, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate inputs
      if (!formData.name.trim()) {
        setError("Item name is required");
        setIsLoading(false);
        return;
      }

      // Submit the item data
      if (isEditMode) {
        await itemApi.updateItem(item.id, formData);
      } else {
        await itemApi.createItem(formData);
      }

      // Close modal and trigger success callback
      onOpenChange(false);
      onSuccess();

      // Show success toast only if not suppressed
      if (!suppressSuccessToast) {
        addToast({
          title: isEditMode ? "Item Updated" : "Item Created",
          description: isEditMode
            ? "Item has been successfully updated."
            : "A new item has been added.",
          color: "success",
          variant: "flat",
          radius: "md",
          icon: "success",
        });
      }
    } catch (err) {
      console.error("Error saving item:", err);
      setError(err.message || "Failed to save item");

      // Show error toast
      addToast({
        title: "Failed to Save Item",
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
        <ModalHeader>{isEditMode ? "Edit Item" : "Add New Item"}</ModalHeader>
        <ModalBody>
          {error && (
            <div className="mb-4 p-3 bg-danger-50 text-danger rounded-lg">
              {error}
            </div>
          )}

          <form id="item-form" onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              label="Item Name"
              placeholder="Enter item name"
              value={formData.name}
              onChange={handleChange}
              startContent={<Tag size={16} className="text-default-400" />}
              isRequired
            />

            <Input
              name="abbreviation"
              label="Abbreviation"
              placeholder="Enter abbreviation (optional)"
              value={formData.abbreviation}
              onChange={handleChange}
              startContent={
                <AlignLeft size={16} className="text-default-400" />
              }
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
            form="item-form"
            isLoading={isLoading}
          >
            {isEditMode ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
