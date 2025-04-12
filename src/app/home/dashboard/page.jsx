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
import { expenseApi } from "@/lib/supabase/client";
import GoldRateCalculator from "@/components/ui/gold-rate-calculator";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [expenseSummary, setExpenseSummary] = useState({
    total: 0,
    today: 0,
    week: 0,
    month: 0,
    threeMonths: 0,
  });
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch all expenses
        const expenses = await expenseApi.getAllExpenses();

        // Calculate date ranges
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const monthAgo = new Date(now);
        monthAgo.setDate(monthAgo.getDate() - 30);

        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);

        // Calculate totals for different time periods
        const total = expenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );

        const todayTotal = expenses
          .filter((expense) => new Date(expense.created_at) >= todayStart)
          .reduce((sum, expense) => sum + expense.amount, 0);

        const weekTotal = expenses
          .filter((expense) => new Date(expense.created_at) >= weekAgo)
          .reduce((sum, expense) => sum + expense.amount, 0);

        const monthTotal = expenses
          .filter((expense) => new Date(expense.created_at) >= monthAgo)
          .reduce((sum, expense) => sum + expense.amount, 0);

        const threeMonthsTotal = expenses
          .filter((expense) => new Date(expense.created_at) >= threeMonthsAgo)
          .reduce((sum, expense) => sum + expense.amount, 0);

        setExpenseSummary({
          total,
          today: todayTotal,
          week: weekTotal,
          month: monthTotal,
          threeMonths: threeMonthsTotal,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Get the display amount based on the active filter
  const getDisplayAmount = () => {
    switch (activeFilter) {
      case "today":
        return expenseSummary.today;
      case "week":
        return expenseSummary.week;
      case "month":
        return expenseSummary.month;
      case "3months":
        return expenseSummary.threeMonths;
      default:
        return expenseSummary.total;
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="mb-6">
          <GoldRateCalculator />
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader className="flex justify-between items-center flex-wrap">
              <h2 className="text-lg font-medium">Total Expenses</h2>
              <div className="flex gap-2 mt-2 sm:mt-0 flex-wrap">
                <Chip
                  color={activeFilter === "all" ? "primary" : "default"}
                  variant={activeFilter === "all" ? "solid" : "flat"}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("all")}
                >
                  All Time
                </Chip>
                <Chip
                  color={activeFilter === "today" ? "primary" : "default"}
                  variant={activeFilter === "today" ? "solid" : "flat"}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("today")}
                >
                  Today
                </Chip>
                <Chip
                  color={activeFilter === "week" ? "primary" : "default"}
                  variant={activeFilter === "week" ? "solid" : "flat"}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("week")}
                >
                  7 Days
                </Chip>
                <Chip
                  color={activeFilter === "month" ? "primary" : "default"}
                  variant={activeFilter === "month" ? "solid" : "flat"}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("month")}
                >
                  1 Month
                </Chip>
                <Chip
                  color={activeFilter === "3months" ? "primary" : "default"}
                  variant={activeFilter === "3months" ? "solid" : "flat"}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("3months")}
                >
                  3 Months
                </Chip>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="py-6">
              <p className="text-4xl font-bold">
                ${getDisplayAmount().toFixed(2)}
              </p>
              <p className="text-sm text-default-500 mt-2">
                {activeFilter === "all"
                  ? "Total expenses across all time"
                  : activeFilter === "today"
                    ? "Expenses added today"
                    : activeFilter === "week"
                      ? "Expenses from the last 7 days"
                      : activeFilter === "month"
                        ? "Expenses from the last 30 days"
                        : "Expenses from the last 90 days"}
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Gold Rate Calculator */}
    </div>
  );
}
