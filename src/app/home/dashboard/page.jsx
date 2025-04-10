"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Divider, Spinner } from "@heroui/react";
import { expenseApi, categoryApi } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    categoryCount: 0,
    recentExpenses: [],
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch expenses and categories
        const [expenses, categories] = await Promise.all([
          expenseApi.getAllExpenses(),
          categoryApi.getAllCategories(),
        ]);

        // Calculate total expenses
        const totalExpenses = expenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );

        // Get 5 most recent expenses
        const recentExpenses = expenses
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setSummary({
          totalExpenses,
          categoryCount: categories.length,
          recentExpenses,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-0">
            <h2 className="text-lg font-medium">Total Expenses</h2>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold">
              ${summary.totalExpenses.toFixed(2)}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <h2 className="text-lg font-medium">Categories</h2>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold">{summary.categoryCount}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Recent Expenses</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          {summary.recentExpenses.length > 0 ? (
            <div className="space-y-4">
              {summary.recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-default-500">
                      {expense.category?.name || "Uncategorized"} •
                      {new Date(expense.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold">${expense.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-default-500">No recent expenses found.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
