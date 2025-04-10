"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  addToast,
} from "@heroui/react";
import { categoryApi, expenseApi } from "@/lib/supabase/client";
import { Calendar, DollarSign, FileText, Tag } from "lucide-react";

export default function ExpenseForm({
  isOpen,
  onOpenChange,
  expense = null,
  onSuccess,
  suppressSuccessToast = false, // New prop to control toast
}) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category_id: "",
    created_at: new Date().toISOString().split("T")[0],
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!expense;

  useEffect(() => {
    // Load categories
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        addToast({
          title: "Failed to load categories",
          description: err.message,
          color: "danger",
          variant: "flat",
          radius: "md",
          icon: "error"
        });
      }
    };

    fetchCategories();

    // If editing, set form data from expense
    if (expense) {
      setFormData({
        description: expense.description || "",
        amount: expense.amount?.toString() || "",
        category_id: expense.category_id || "",
        created_at: expense.created_at
          ? new Date(expense.created_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate amount
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid amount");
        setIsLoading(false);
        return;
      }

      // Validate description
      if (!formData.description.trim()) {
        setError("Description is required");
        setIsLoading(false);
        return;
      }

      const data = {
        description: formData.description.trim(),
        amount: amount,
        category_id: formData.category_id || null,
        created_at: formData.created_at,
      };

      if (isEditMode) {
        await expenseApi.updateExpense(expense.id, data);
      } else {
        await expenseApi.createExpense(data);
      }

      // Close modal and trigger success callback
      onOpenChange(false);
      onSuccess();

      // Show success toast only if not suppressed
      if (!suppressSuccessToast) {
        addToast({
          title: isEditMode ? "Expense Updated" : "Expense Created",
          description: isEditMode
            ? "Expense has been successfully updated."
            : "A new expense has been added.",
          color: "success",
          variant: "flat",
          radius: "md",
          icon: "success"
        });
      }
    } catch (err) {
      console.error("Error saving expense:", err);
      setError(err.message || "Failed to save expense");
      
      // Show error toast
      addToast({
        title: "Failed to Save Expense",
        description: err.message || "An unexpected error occurred",
        color: "danger",
        variant: "flat",
        radius: "md",
        icon: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          {isEditMode ? "Edit Expense" : "Add New Expense"}
        </ModalHeader>
        <ModalBody>
          {error && (
            <div className="mb-4 p-3 bg-danger-50 text-danger rounded-lg">
              {error}
            </div>
          )}

          <form id="expense-form" onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="description"
              label="Description"
              placeholder="Enter expense description"
              value={formData.description}
              onChange={handleChange}
              startContent={<FileText size={16} className="text-default-400" />}
              isRequired
            />

            <Input
              name="amount"
              label="Amount"
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <DollarSign size={16} className="text-default-400" />
                </div>
              }
              isRequired
            />

            <Select
              name="category_id"
              label="Category"
              placeholder="Select a category"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              startContent={<Tag size={16} className="text-default-400" />}
            >
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </Select>

            <Input
              name="created_at"
              label="Date"
              type="date"
              value={formData.created_at}
              onChange={handleChange}
              startContent={<Calendar size={16} className="text-default-400" />}
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
            form="expense-form"
            isLoading={isLoading}
          >
            {isEditMode ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}