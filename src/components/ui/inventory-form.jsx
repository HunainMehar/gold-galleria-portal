"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Divider,
  addToast,
} from "@heroui/react";
import { inventoryApi, itemApi } from "@/lib/supabase/client";
import {
  Tag,
  Package,
  FileText,
  Scale,
  Percent,
  Gem,
  Image as ImageIcon,
  Calculator,
  Award,
} from "lucide-react";

export default function InventoryForm({
  isOpen,
  onOpenChange,
  inventoryItem = null,
  onSuccess,
  suppressSuccessToast = false,
}) {
  const [formData, setFormData] = useState({
    item_id: "",
    description: "",
    quantity: 1,
    karat: 22, // Default value
    net_weight: "",
    wasteage_percentage: 0,
    polish_weight: 0,
    stone_weight: 0,
    ratti: 0,
    images: [],
  });

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingItems, setIsFetchingItems] = useState(true);
  const [error, setError] = useState("");
  const [calculatedValues, setCalculatedValues] = useState({
    total_weight: 0,
    pure_gold: 0,
  });

  const isEditMode = !!inventoryItem;

  // Fetch items for the dropdown
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsFetchingItems(true);
        const data = await itemApi.getAllItems();
        setItems(data);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError("Failed to load items. Please try again.");
      } finally {
        setIsFetchingItems(false);
      }
    };

    fetchItems();
  }, []);

  // Set form data if editing
  useEffect(() => {
    if (inventoryItem) {
      // Extract the images array from the inventoryItem
      const imagesArray = Array.isArray(inventoryItem.images)
        ? inventoryItem.images
        : typeof inventoryItem.images === "string"
          ? JSON.parse(inventoryItem.images)
          : [];

      setFormData({
        item_id: inventoryItem.item_id || "",
        description: inventoryItem.description || "",
        quantity: inventoryItem.quantity || 1,
        karat: inventoryItem.karat || 22,
        net_weight: inventoryItem.net_weight || "",
        wasteage_percentage: inventoryItem.wasteage_percentage || 0,
        polish_weight: inventoryItem.polish_weight || 0,
        stone_weight: inventoryItem.stone_weight || 0,
        ratti: inventoryItem.ratti || 0,
        images: imagesArray,
      });
    } else {
      // Reset form for new item
      setFormData({
        item_id: "",
        description: "",
        quantity: 1,
        karat: 22,
        net_weight: "",
        wasteage_percentage: 0,
        polish_weight: 0,
        stone_weight: 0,
        ratti: 0,
        images: [],
      });
    }
  }, [inventoryItem, isOpen]);

  // Calculate derived values when form data changes
  useEffect(() => {
    // Calculate total weight
    const netWeight = parseFloat(formData.net_weight) || 0;
    const wasteage =
      (netWeight * (parseFloat(formData.wasteage_percentage) || 0)) / 100;
    const polishWeight = parseFloat(formData.polish_weight) || 0;
    const stoneWeight = parseFloat(formData.stone_weight) || 0;
    const totalWeight = netWeight + wasteage + polishWeight + stoneWeight;

    // Calculate pure gold
    const karat = parseFloat(formData.karat) || 0;
    const ratti = parseFloat(formData.ratti) || 0;
    const pureGold = (netWeight / 96) * (96 - ratti);

    setCalculatedValues({
      total_weight: parseFloat(totalWeight.toFixed(3)),
      pure_gold: parseFloat(pureGold.toFixed(3)),
    });
  }, [formData]);

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
      if (!formData.item_id) {
        setError("Please select an item");
        setIsLoading(false);
        return;
      }

      if (!formData.net_weight || parseFloat(formData.net_weight) <= 0) {
        setError("Net weight must be greater than 0");
        setIsLoading(false);
        return;
      }

      if (isEditMode) {
        await inventoryApi.updateInventory(inventoryItem.id, formData);
      } else {
        await inventoryApi.createInventory(formData);
      }

      // Close modal and trigger success callback
      onOpenChange(false);
      onSuccess();

      // Show success toast only if not suppressed
      if (!suppressSuccessToast) {
        addToast({
          title: isEditMode ? "Inventory Updated" : "Inventory Added",
          description: isEditMode
            ? "Inventory item has been successfully updated."
            : "A new inventory item has been added.",
          color: "success",
          variant: "flat",
          radius: "md",
          icon: "success",
        });
      }
    } catch (err) {
      console.error("Error saving inventory item:", err);
      setError(err.message || "Failed to save inventory item");

      // Show error toast
      addToast({
        title: "Failed to Save",
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
        <ModalHeader>
          {isEditMode ? "Edit Inventory Item" : "Add New Inventory Item"}
        </ModalHeader>
        <ModalBody>
          {error && (
            <div className="mb-4 p-3 bg-danger-50 text-danger rounded-lg">
              {error}
            </div>
          )}

          <form
            id="inventory-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Basic Information Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Tag size={16} className="text-primary" />
                <h3 className="text-medium font-semibold">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isEditMode && (
                  <Input
                    label="Tag Number"
                    value={
                      inventoryItem?.tag_number || "Automatically Generated"
                    }
                    isReadOnly
                    startContent={
                      <Tag size={16} className="text-default-400" />
                    }
                  />
                )}

                <Select
                  label="Item"
                  placeholder={
                    isFetchingItems ? "Loading items..." : "Select an item"
                  }
                  selectedKeys={formData.item_id ? [formData.item_id] : []}
                  onChange={(e) =>
                    setFormData({ ...formData, item_id: e.target.value })
                  }
                  startContent={
                    <Package size={16} className="text-default-400" />
                  }
                  isRequired
                  isDisabled={isFetchingItems}
                >
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}{" "}
                      {item.abbreviation && `(${item.abbreviation})`}
                    </SelectItem>
                  ))}
                </Select>

                <Textarea
                  name="description"
                  label="Description"
                  placeholder="Enter item description"
                  value={formData.description}
                  onChange={handleChange}
                  startContent={
                    <FileText size={16} className="text-default-400 mt-1" />
                  }
                  minRows={2}
                  className="md:col-span-2"
                />

                <Input
                  name="quantity"
                  label="Quantity"
                  type="number"
                  min="1"
                  value={formData.quantity.toString()}
                  onChange={handleChange}
                  startContent={<Tag size={16} className="text-default-400" />}
                  isRequired
                />
              </div>
            </div>

            <Divider />

            {/* Weight and Measurements Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Scale size={16} className="text-primary" />
                <h3 className="text-medium font-semibold">
                  Weight & Measurements
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  name="karat"
                  label="Karat"
                  selectedKeys={[formData.karat.toString()]}
                  renderValue={() => `${formData.karat}k`}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    setFormData({
                      ...formData,
                      karat: parseInt(selectedKey),
                    });
                  }}
                  startContent={
                    <Award size={16} className="text-default-400" />
                  }
                  isRequired
                >
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((k) => (
                    <SelectItem key={k.toString()} value={k.toString()}>
                      {k}k
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  name="net_weight"
                  label="Net Weight (grams)"
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.net_weight.toString()}
                  onChange={handleChange}
                  startContent={
                    <Scale size={16} className="text-default-400" />
                  }
                  isRequired
                />

                <Input
                  name="wasteage_percentage"
                  label="Wasteage (%)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.wasteage_percentage.toString()}
                  onChange={handleChange}
                  startContent={
                    <Percent size={16} className="text-default-400" />
                  }
                />

                <Input
                  name="polish_weight"
                  label="Polish Weight (grams)"
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.polish_weight.toString()}
                  onChange={handleChange}
                  startContent={
                    <Scale size={16} className="text-default-400" />
                  }
                />

                <Input
                  name="stone_weight"
                  label="Stone Weight (grams)"
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.stone_weight.toString()}
                  onChange={handleChange}
                  startContent={<Gem size={16} className="text-default-400" />}
                />

                <Input
                  name="ratti"
                  label="Ratti"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.ratti.toString()}
                  onChange={handleChange}
                  startContent={<Gem size={16} className="text-default-400" />}
                />
              </div>
            </div>

            <Divider />

            {/* Calculated Values Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Calculator size={16} className="text-primary" />
                <h3 className="text-medium font-semibold">Calculated Values</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Total Weight (grams)"
                  value={calculatedValues.total_weight.toString()}
                  isReadOnly
                  startContent={
                    <Scale size={16} className="text-default-400" />
                  }
                  description="Net weight + Wasteage + Polish weight + Stone weight"
                />

                <Input
                  label="Pure Gold"
                  value={calculatedValues.pure_gold.toString()}
                  isReadOnly
                  startContent={
                    <Award size={16} className="text-default-400" />
                  }
                  description="(Net weight/96) × (96 - Ratti)"
                />
              </div>
            </div>

            <Divider />

            {/* Images Section - Placeholder for now */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon size={16} className="text-primary" />
                <h3 className="text-medium font-semibold">Images</h3>
              </div>

              <div className="p-4 border border-dashed border-default-300 rounded-lg text-center">
                <p className="text-default-500">
                  Image upload functionality will be implemented in a future
                  update.
                </p>
                {formData.images.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-default-600">
                      {formData.images.length} image(s) attached
                    </p>
                  </div>
                )}
              </div>
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
            form="inventory-form"
            isLoading={isLoading}
          >
            {isEditMode ? "Update" : "Add to Inventory"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
