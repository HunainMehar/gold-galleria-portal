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
  Chip,
  useDisclosure,
  Spinner,
  addToast,
} from "@heroui/react";
import { expenseApi } from "@/lib/supabase/client";
import ExpenseForm from "@/components/ui/expense-form";
import { PlusCircle, Edit, Trash2, Eye, MoreVertical } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentExpense, setCurrentExpense] = useState(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await expenseApi.getAllExpenses();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      addToast({
        title: "Failed to fetch expenses",
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
    fetchExpenses();
  }, []);

  const handleAddExpense = () => {
    setCurrentExpense(null);
    onOpen();
  };

  const handleEditExpense = (expense) => {
    setCurrentExpense(expense);
    onOpen();
  };

  const handleDeleteExpense = async (id) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await expenseApi.deleteExpense(id);
        setExpenses(expenses.filter((expense) => expense.id !== id));
        addToast({
          title: "Expense Deleted",
          description: "The expense has been successfully removed.",
          color: "success",
          variant: "flat",
          radius: "md",
          icon: "success"
        });
      } catch (error) {
        console.error("Error deleting expense:", error);
        addToast({
          title: "Failed to delete expense",
          description: error.message,
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
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Button
          color="primary"
          onPress={handleAddExpense}
          startContent={<PlusCircle size={18} />}
        >
          Add Expense
        </Button>
      </div>

      <Card>
        <CardHeader>All Expenses</CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner color="primary" size="lg" />
            </div>
          ) : (
            <Table 
              aria-label="Expenses table"
              selectionMode="single"
              onRowAction={(key) => router.push(`/home/expenses/${key}`)}
              classNames={{
                tr: "cursor-pointer hover:bg-default-50 transition-colors",
              }}
            >
              <TableHeader>
                <TableColumn>Description</TableColumn>
                <TableColumn>Category</TableColumn>
                <TableColumn>Amount</TableColumn>
                <TableColumn>Date</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No expenses found">
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      {expense.category ? (
                        <Chip size="sm" color="primary" variant="flat">
                          {expense.category.name}
                        </Chip>
                      ) : (
                        <Chip size="sm" color="default" variant="flat">
                          Uncategorized
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>${expense.amount.toFixed(2)}</TableCell>
                    <TableCell>{formatDate(expense.created_at)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button size="sm" variant="light">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Actions">
                            <DropdownItem
                              key="view"
                              href={`/home/expenses/${expense.id}`}
                              as={Link}
                              startContent={<Eye size={16} />}
                            >
                              View Details
                            </DropdownItem>
                            <DropdownItem
                              key="edit"
                              onPress={() => handleEditExpense(expense)}
                              startContent={<Edit size={16} />}
                            >
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              color="danger"
                              onPress={() => handleDeleteExpense(expense.id)}
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

      <ExpenseForm
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        expense={currentExpense}
        onSuccess={() => {
          fetchExpenses();
          addToast({
            title: currentExpense ? "Expense Updated" : "Expense Created",
            description: currentExpense 
              ? "The expense has been successfully updated." 
              : "A new expense has been added.",
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