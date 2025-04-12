"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Divider,
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  ScrollShadow,
  addToast,
} from "@heroui/react";
import { salesApi } from "@/lib/supabase/client";
import {
  User,
  Phone,
  FileText,
  Tag,
  Trash2,
  DollarSign,
  Receipt,
  Image as ImageIcon,
} from "lucide-react";

export default function SaleForm({ isOpen, onOpenChange, onSuccess }) {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    notes: "",
    items: [],
  });
  const [availableItems, setAvailableItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingItems, setIsFetchingItems] = useState(true);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemPrices, setItemPrices] = useState({});

  // Calculate total from all items
  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + (parseFloat(itemPrices[item.id] || 0) || 0),
    0
  );

  // Fetch available inventory items for selection
  useEffect(() => {
    const fetchAvailableItems = async () => {
      try {
        setIsFetchingItems(true);
        const data = await salesApi.getAvailableInventory();
        setAvailableItems(data || []);
      } catch (err) {
        console.error("Error fetching available inventory:", err);
        setError("Failed to load inventory items. Please try again.");
      } finally {
        setIsFetchingItems(false);
      }
    };

    if (isOpen) {
      fetchAvailableItems();
    }
  }, [isOpen]);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      customer_name: "",
      customer_phone: "",
      notes: "",
      items: [],
    });
    setSelectedItems([]);
    setItemPrices({});
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemSelect = (key) => {
    const item = availableItems.find((item) => item.id === key);
    if (item && !selectedItems.some((selected) => selected.id === item.id)) {
      setSelectedItems((prev) => [...prev, item]);

      // Initialize the price for this item (could be based on weight, karat, etc.)
      const suggestedPrice = calculateSuggestedPrice(item);
      setItemPrices((prev) => ({
        ...prev,
        [item.id]: suggestedPrice,
      }));
    }
  };

  // Calculate a suggested price based on the item's attributes
  const calculateSuggestedPrice = (item) => {
    // This is a placeholder - you would implement your own pricing logic
    // For example, price based on weight, gold rate, karat, etc.
    const basePrice = (item.pure_gold || 0) * 50; // Example: $50 per gram of pure gold
    return basePrice > 0 ? basePrice.toFixed(2) : "";
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
    setItemPrices((prev) => {
      const newPrices = { ...prev };
      delete newPrices[itemId];
      return newPrices;
    });
  };

  const handlePriceChange = (itemId, value) => {
    setItemPrices((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  // Extract the first image URL from the images array/object
  const getItemImage = (item) => {
    if (!item || !item.images) return null;

    try {
      let imagesArray = item.images;

      // Parse images if it's a string
      if (typeof item.images === "string") {
        imagesArray = JSON.parse(item.images);
      }

      // Extract URL from first image
      if (Array.isArray(imagesArray) && imagesArray.length > 0) {
        const firstImage = imagesArray[0];
        if (typeof firstImage === "string") return firstImage;
        if (firstImage && firstImage.url) return firstImage.url;
      }
    } catch (error) {
      console.error("Error parsing image:", error);
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate inputs
      if (!formData.customer_name.trim()) {
        throw new Error("Customer name is required");
      }

      if (selectedItems.length === 0) {
        throw new Error("Please select at least one item to sell");
      }

      // Check if all items have prices
      const itemsWithoutPrices = selectedItems.filter(
        (item) => !itemPrices[item.id] || parseFloat(itemPrices[item.id]) <= 0
      );

      if (itemsWithoutPrices.length > 0) {
        throw new Error("All items must have a price greater than zero");
      }

      // Prepare items for submission
      const itemsData = selectedItems.map((item) => ({
        inventory_id: item.id,
        price: parseFloat(itemPrices[item.id]),
      }));

      // Create the sale
      const saleData = await salesApi.createSale({
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        notes: formData.notes.trim(),
        items: itemsData,
      });

      // Close modal and trigger success callback
      onOpenChange(false);

      if (onSuccess) {
        onSuccess(saleData);
      }

      addToast({
        title: "Sale Created",
        description: `Sale invoice #${saleData.invoice_number} has been created successfully`,
        color: "success",
        variant: "flat",
        radius: "md",
        icon: "success",
      });
    } catch (err) {
      console.error("Error creating sale:", err);
      setError(err.message || "Failed to create sale");

      addToast({
        title: "Failed to Create Sale",
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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          <span>Create New Sale</span>
        </ModalHeader>
        <ModalBody className="max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-danger-50 text-danger rounded-lg">
              {error}
            </div>
          )}

          <form id="sale-form" onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-medium font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="customer_name"
                    label="Customer Name"
                    placeholder="Enter customer name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    startContent={
                      <User size={16} className="text-default-400" />
                    }
                    isRequired
                  />
                  <Input
                    name="customer_phone"
                    label="Phone Number"
                    placeholder="Enter phone number"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    startContent={
                      <Phone size={16} className="text-default-400" />
                    }
                  />
                </div>
              </div>

              <Divider />

              {/* Item Selection */}
              <div>
                <h3 className="text-medium font-semibold mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  Select Items
                </h3>

                <Autocomplete
                  label="Search Inventory Items"
                  placeholder="Search by tag number or item name"
                  isLoading={isFetchingItems}
                  defaultItems={availableItems}
                  onSelectionChange={handleItemSelect}
                  clearable
                >
                  {(item) => (
                    <AutocompleteItem key={item.id} textValue={item.tag_number}>
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={getItemImage(item)}
                          fallback={
                            <ImageIcon size={16} className="text-default-500" />
                          }
                          className="h-8 w-8 bg-default-100"
                        />
                        <div>
                          <div className="text-sm font-medium">
                            {item.tag_number}
                          </div>
                          <div className="text-xs text-default-500">
                            {item.item?.name || "Unknown Item"}
                            {item.item?.abbreviation &&
                              ` (${item.item.abbreviation})`}
                            {item.pure_gold &&
                              ` - ${parseFloat(item.pure_gold).toFixed(2)}g pure gold`}
                          </div>
                        </div>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>

                {/* Selected Items */}
                {selectedItems.length > 0 && (
                  <div className="mt-4">
                    <ScrollShadow className="max-h-[300px]">
                      <Table aria-label="Selected items for sale">
                        <TableHeader>
                          <TableColumn>Item</TableColumn>
                          <TableColumn>Details</TableColumn>
                          <TableColumn>Price ($)</TableColumn>
                          <TableColumn>Actions</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {selectedItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar
                                    src={getItemImage(item)}
                                    fallback={
                                      <ImageIcon
                                        size={16}
                                        className="text-default-500"
                                      />
                                    }
                                    className="h-8 w-8 bg-default-100"
                                  />
                                  <div>
                                    <span className="font-medium">
                                      {item.tag_number}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {item.item?.name || "Unknown Item"}
                                  {item.item?.abbreviation &&
                                    ` (${item.item.abbreviation})`}
                                </div>
                                <div className="text-xs text-default-500">
                                  {item.karat}K,{" "}
                                  {parseFloat(item.net_weight).toFixed(2)}g
                                </div>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={itemPrices[item.id] || ""}
                                  onChange={(e) =>
                                    handlePriceChange(item.id, e.target.value)
                                  }
                                  startContent={
                                    <DollarSign
                                      size={16}
                                      className="text-default-400"
                                    />
                                  }
                                  placeholder="Enter price"
                                  isRequired
                                  size="sm"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  isIconOnly
                                  color="danger"
                                  variant="light"
                                  onPress={() => handleRemoveItem(item.id)}
                                  size="sm"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollShadow>
                  </div>
                )}
              </div>

              <Divider />

              {/* Additional Information */}
              <div>
                <h3 className="text-medium font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Additional Information
                </h3>

                <Textarea
                  name="notes"
                  label="Notes"
                  placeholder="Add any additional notes about the sale"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>

              {/* Summary */}
              {selectedItems.length > 0 && (
                <Card>
                  <CardBody className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="text-large font-bold">Total Amount:</div>
                      <div className="text-large font-bold">
                        ${totalAmount.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-default-500 mt-1">
                      <div>
                        {selectedItems.length} item
                        {selectedItems.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
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
            form="sale-form"
            isLoading={isLoading}
          >
            Create Sale
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
