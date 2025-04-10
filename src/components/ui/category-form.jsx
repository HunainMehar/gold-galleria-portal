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
import { categoryApi } from "@/lib/supabase/client";
import { Tag } from "lucide-react";

export default function CategoryForm({
  isOpen,
  onOpenChange,
  category = null,
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!category;

  useEffect(() => {
    if (category) {
      setName(category.name || "");
    } else {
      setName("");
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!name.trim()) {
      setError("Category name is required");
      setIsLoading(false);
      return;
    }

    try {
      if (isEditMode) {
        await categoryApi.updateCategory(category.id, { name });
      } else {
        await categoryApi.createCategory({ name });
      }

      // Close modal and trigger success callback
      onOpenChange(false);
      onSuccess();

      // Show success toast
      addToast({
        title: isEditMode ? "Category Updated" : "Category Created",
        description: isEditMode
          ? "Category has been successfully updated."
          : "A new category has been added.",
        color: "success",
        variant: "flat",
        radius: "md",
        icon: "success",
      });
    } catch (err) {
      console.error("Error saving category:", err);
      setError(err.message || "Failed to save category");

      // Show error toast
      addToast({
        title: "Failed to Save Category",
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
          {isEditMode ? "Edit Category" : "Add New Category"}
        </ModalHeader>
        <ModalBody>
          {error && (
            <div className="mb-4 p-3 bg-danger-50 text-danger rounded-lg">
              {error}
            </div>
          )}

          <form id="category-form" onSubmit={handleSubmit}>
            <Input
              label="Category Name"
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              startContent={<Tag size={16} className="text-default-400" />}
              isRequired
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
            form="category-form"
            isLoading={isLoading}
          >
            {isEditMode ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
