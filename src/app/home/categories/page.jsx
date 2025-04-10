"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  Spinner,
  addToast,
} from "@heroui/react";
import { categoryApi } from "@/lib/supabase/client";
import CategoryForm from "@/components/ui/category-form";
import { PlusCircle, Edit, Trash2, MoreVertical } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      addToast({
        title: "Failed to fetch categories",
        description: error.message,
        color: "danger",
        variant: "flat",
        radius: "md",
        icon: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setCurrentCategory(null);
    onOpen();
  };

  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    onOpen();
  };

  const handleDeleteCategory = async (id) => {
    if (
      confirm(
        "Are you sure you want to delete this category? This may affect expenses assigned to this category."
      )
    ) {
      try {
        await categoryApi.deleteCategory(id);
        setCategories(categories.filter((category) => category.id !== id));
        addToast({
          title: "Category Deleted",
          description: "The category has been successfully removed.",
          color: "success",
          variant: "flat",
          radius: "md",
          icon: "success"
        });
      } catch (error) {
        console.error("Error deleting category:", error);
        addToast({
          title: "Failed to delete category",
          description: "The category may be in use by existing expenses.",
          color: "danger",
          variant: "flat",
          radius: "md",
          icon: "error"
        });
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button
          color="primary"
          onPress={handleAddCategory}
          startContent={<PlusCircle size={18} />}
        >
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>All Categories</CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner color="primary" size="lg" />
            </div>
          ) : (
            <Table aria-label="Categories table">
              <TableHeader>
                <TableColumn>Name</TableColumn>
                <TableColumn>Created At</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No categories found">
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{formatDate(category.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button size="sm" variant="light">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Actions">
                            <DropdownItem
                              key="edit"
                              onPress={() => handleEditCategory(category)}
                              startContent={<Edit size={16} />}
                            >
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              color="danger"
                              onPress={() => handleDeleteCategory(category.id)}
                              startContent={<Trash2 size={16} />}
                            >
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <CategoryForm
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        category={currentCategory}
        onSuccess={() => {
          fetchCategories();
          addToast({
            title: currentCategory ? "Category Updated" : "Category Created",
            description: currentCategory 
              ? "The category has been successfully updated." 
              : "A new category has been added.",
            color: "success",
            variant: "flat",
            radius: "md",
            icon: "success"
          });
        }}
      />
    </div>
  );
}