"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
  Chip,
} from "@heroui/react";
import { expenseApi, categoryApi } from "@/lib/supabase/client";
import GoldRateCalculator from "@/components/ui/gold-rate-calculator";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    categoryCount: 0,
    recentExpenses: [],
    filteredExpenses: [],
  });
  const [activeFilter, setActiveFilter] = useState("all");

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
          filteredExpenses: recentExpenses, // Initially show all expenses
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const filterExpenses = (filter) => {
    setActiveFilter(filter);

    const now = new Date();
    let filteredExpenses = summary.recentExpenses;

    switch (filter) {
      case "today":
        // Filter for today (same day)
        filteredExpenses = summary.recentExpenses.filter((expense) => {
          const expenseDate = new Date(expense.created_at);
          return expenseDate.toDateString() === now.toDateString();
        });
        break;
      case "week":
        // Filter for last 7 days
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredExpenses = summary.recentExpenses.filter((expense) => {
          const expenseDate = new Date(expense.created_at);
          return expenseDate >= weekAgo;
        });
        break;
      case "month":
        // Filter for last 30 days
        const monthAgo = new Date(now);
        monthAgo.setDate(monthAgo.getDate() - 30);
        filteredExpenses = summary.recentExpenses.filter((expense) => {
          const expenseDate = new Date(expense.created_at);
          return expenseDate >= monthAgo;
        });
        break;
      case "3months":
        // Filter for last 90 days
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
        filteredExpenses = summary.recentExpenses.filter((expense) => {
          const expenseDate = new Date(expense.created_at);
          return expenseDate >= threeMonthsAgo;
        });
        break;
      default:
        // Show all by default
        filteredExpenses = summary.recentExpenses;
    }

    setSummary((prev) => ({
      ...prev,
      filteredExpenses,
    }));
  };

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

      {/* Gold Rate Calculator */}
      <div className="mb-6">
        <GoldRateCalculator />
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center flex-wrap">
          <h2 className="text-lg font-medium">Recent Expenses</h2>
          <div className="flex gap-2 mt-2 sm:mt-0 flex-wrap">
            <Chip
              color={activeFilter === "all" ? "primary" : "default"}
              variant={activeFilter === "all" ? "solid" : "flat"}
              className="cursor-pointer"
              onClick={() => filterExpenses("all")}
            >
              All
            </Chip>
            <Chip
              color={activeFilter === "today" ? "primary" : "default"}
              variant={activeFilter === "today" ? "solid" : "flat"}
              className="cursor-pointer"
              onClick={() => filterExpenses("today")}
            >
              Today
            </Chip>
            <Chip
              color={activeFilter === "week" ? "primary" : "default"}
              variant={activeFilter === "week" ? "solid" : "flat"}
              className="cursor-pointer"
              onClick={() => filterExpenses("week")}
            >
              7 Days
            </Chip>
            <Chip
              color={activeFilter === "month" ? "primary" : "default"}
              variant={activeFilter === "month" ? "solid" : "flat"}
              className="cursor-pointer"
              onClick={() => filterExpenses("month")}
            >
              1 Month
            </Chip>
            <Chip
              color={activeFilter === "3months" ? "primary" : "default"}
              variant={activeFilter === "3months" ? "solid" : "flat"}
              className="cursor-pointer"
              onClick={() => filterExpenses("3months")}
            >
              3 Months
            </Chip>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          {summary.filteredExpenses.length > 0 ? (
            <div className="space-y-4">
              {summary.filteredExpenses.map((expense) => (
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
            <p className="text-default-500">
              No expenses found for the selected period.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
