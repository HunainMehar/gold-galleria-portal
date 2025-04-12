"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  addToast,
} from "@heroui/react";
import { DollarSign, Save, Calculator, Star } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function GoldRateCalculator() {
  const [rate24k, setRate24k] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedRate, setSavedRate] = useState(null);
  const [karatRates, setKaratRates] = useState([]);

  // Karats to calculate
  const karats = Array.from({ length: 24 }, (_, i) => 24 - i);

  // Fetch the current gold rate from the database
  useEffect(() => {
    async function fetchGoldRate() {
      try {
        const { data, error } = await supabase
          .from("gold_rates")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setSavedRate(data[0]);
          setRate24k(data[0].rate_24k.toString());
          calculateKaratRates(data[0].rate_24k);
        }
      } catch (error) {
        console.error("Error fetching gold rate:", error);
      }
    }

    fetchGoldRate();
  }, []);

  // Calculate rates for different karats
  const calculateKaratRates = (baseRate) => {
    const baseRateNum = parseFloat(baseRate);
    if (isNaN(baseRateNum)) return;

    const rates = karats.map((karat) => ({
      karat,
      rate: ((baseRateNum / 24) * karat).toFixed(2),
    }));

    setKaratRates(rates);
  };

  // Handle rate change during editing
  const handleRateChange = (e) => {
    const value = e.target.value;
    setRate24k(value);
    calculateKaratRates(value);
  };

  // Toggle edit mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Save the new rate to the database
  const saveRate = async () => {
    setIsLoading(true);

    try {
      const rateValue = parseFloat(rate24k);

      if (isNaN(rateValue) || rateValue <= 0) {
        throw new Error("Please enter a valid gold rate");
      }

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Insert the new gold rate
      const { data, error } = await supabase
        .from("gold_rates")
        .insert({
          rate_24k: rateValue,
          user_id: user.id,
        })
        .select();

      if (error) throw error;

      setSavedRate(data[0]);
      setIsEditing(false);

      addToast({
        title: "Gold Rate Updated",
        description: "The gold rate has been successfully updated.",
        color: "success",
        variant: "flat",
        radius: "md",
        icon: "success",
      });
    } catch (error) {
      console.error("Error saving gold rate:", error);

      addToast({
        title: "Error Saving Rate",
        description: error.message || "An unexpected error occurred",
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
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calculator className="text-primary" size={20} />
          <h2 className="text-lg font-medium">Gold Rate Calculator</h2>
        </div>
        {savedRate && (
          <div className="text-sm text-default-500">
            Last updated: {new Date(savedRate.created_at).toLocaleString()}
          </div>
        )}
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-end gap-2">
              <Input
                size="sm"
                label="Today's 24K Gold Rate (per tola)"
                placeholder="Enter rate"
                value={rate24k}
                onChange={handleRateChange}
                startContent={
                  <DollarSign size={16} className="text-default-400" />
                }
                type="number"
                step="0.01"
                min="0"
                isDisabled={!isEditing}
              />
              <Button
                size="md"
                color={isEditing ? "success" : "primary"}
                onPress={isEditing ? saveRate : toggleEdit}
                isLoading={isLoading}
                startContent={
                  isEditing ? <Save size={16} /> : <Calculator size={16} />
                }
              >
                {isEditing ? "Save Rate" : "Update Rate"}
              </Button>
            </div>
          </div>

          <div>
            <Table aria-label="Gold rates by karat">
              <TableHeader>
                <TableColumn>Karat</TableColumn>
                <TableColumn>Purity</TableColumn>
                <TableColumn>Rate (per tola)</TableColumn>
              </TableHeader>
              <TableBody>
                {karatRates.map((item) => (
                  <TableRow key={item.karat}>
                    <TableCell className="flex items-center gap-1">
                      <Star
                        size={14}
                        className={
                          item.karat === 24
                            ? "text-amber-500"
                            : "text-default-300"
                        }
                      />
                      {item.karat}K
                    </TableCell>
                    <TableCell>
                      {((item.karat / 24) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="font-medium">${item.rate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
