"use client";

import { useEffect, useState } from "react";
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
  useDisclosure,
  Spinner,
  addToast,
  Input,
  Pagination,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Image,
} from "@heroui/react";
import { inventoryApi } from "@/lib/supabase/client";
import InventoryForm from "@/components/ui/inventory-form";
import {
  PlusCircle,
  Edit,
  Search,
  Tag,
  Image as ImageIcon,
} from "lucide-react";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const itemsPerPage = 10;

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getAllInventory();
      setInventory(data);
      applyFilters(data, searchTerm);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      addToast({
        title: "Failed to fetch inventory",
        description: error.message,
        color: "danger",
        variant: "flat",
        radius: "md",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    applyFilters(inventory, searchTerm);
  }, [searchTerm]);

  const applyFilters = (data, search) => {
    let filtered = [...data];

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.tag_number &&
            item.tag_number.toLowerCase().includes(searchLower)) ||
          (item.description &&
            item.description.toLowerCase().includes(searchLower)) ||
          (item.item &&
            item.item.name &&
            item.item.name.toLowerCase().includes(searchLower)) ||
          (item.item &&
            item.item.abbreviation &&
            item.item.abbreviation.toLowerCase().includes(searchLower))
      );
    }

    setFilteredInventory(filtered);
    setCurrentPage(1);
  };

  const handleAddInventory = () => {
    setCurrentItem(null);
    onOpen();
  };

  const handleEditInventory = (item) => {
    setCurrentItem(item);
    onOpen();
  };

  const formatWeight = (weight) => {
    return parseFloat(weight).toFixed(3) + " g";
  };

  // Get the first image from the item's images array
  const getItemImage = (item) => {
    // Case 1: Images is a valid array with objects containing url property
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      const firstImage = item.images[0];
      if (firstImage && firstImage.url) {
        return firstImage.url;
      }
      // If the first image is a string (direct URL)
      if (typeof firstImage === "string") {
        return firstImage;
      }
    }

    // Case 2: Images is a JSON string
    if (item.images && typeof item.images === "string") {
      try {
        const parsed = JSON.parse(item.images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstImage = parsed[0];
          if (firstImage && firstImage.url) {
            return firstImage.url;
          }
          if (typeof firstImage === "string") {
            return firstImage;
          }
        }
      } catch (e) {
        // Not JSON or failed to parse
        console.log("Failed to parse images JSON:", e);
      }
    }

    return null;
  };

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredInventory.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Button
          color="primary"
          onPress={handleAddInventory}
          startContent={<PlusCircle size={18} />}
        >
          Add Item
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search by tag, name, or description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startContent={<Search size={18} className="text-default-400" />}
          className="flex-grow"
          clearable
        />
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>Inventory Items</div>
          <div className="text-default-500 text-sm">
            {filteredInventory.length} item
            {filteredInventory.length !== 1 ? "s" : ""} found
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner color="primary" size="lg" />
            </div>
          ) : (
            <>
              <Table aria-label="Inventory items table">
                <TableHeader>
                  <TableColumn>Item</TableColumn>
                  <TableColumn>Quantity</TableColumn>
                  <TableColumn>Net Weight</TableColumn>
                  <TableColumn>Total Weight</TableColumn>
                  <TableColumn>Karat</TableColumn>
                  <TableColumn>Pure Gold</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No inventory items found">
                  {currentItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Popover placement="right">
                            <PopoverTrigger>
                              <Avatar
                                src={getItemImage(item)}
                                fallback={
                                  <div className="bg-default-200 flex items-center justify-center">
                                    <ImageIcon
                                      size={16}
                                      className="text-default-500"
                                    />
                                  </div>
                                }
                                size="md"
                                radius="sm"
                                className="border border-default-200 cursor-pointer"
                              />
                            </PopoverTrigger>
                            {getItemImage(item) && (
                              <PopoverContent>
                                <Image
                                  src={getItemImage(item)}
                                  alt={item.item?.name || "Item image"}
                                  className="w-64 h-64 object-cover rounded-lg"
                                />
                              </PopoverContent>
                            )}
                          </Popover>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <Tag size={14} className="text-primary" />
                              <span>{item.tag_number}</span>
                            </div>
                            <div className="text-sm text-default-500">
                              {item.item?.name || "Unknown Item"}
                              {item.item?.abbreviation &&
                                ` (${item.item.abbreviation})`}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity || 0}</TableCell>
                      <TableCell>{formatWeight(item.net_weight)}</TableCell>
                      <TableCell>{formatWeight(item.total_weight)}</TableCell>
                      <TableCell>{item.karat}K</TableCell>
                      <TableCell>{formatWeight(item.pure_gold)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => handleEditInventory(item)}
                          startContent={<Edit size={16} />}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    total={totalPages}
                    initialPage={1}
                    page={currentPage}
                    onChange={setCurrentPage}
                    color="primary"
                    showControls
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      <InventoryForm
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        inventoryItem={currentItem}
        onSuccess={() => {
          fetchInventory();
          addToast({
            title: currentItem
              ? "Inventory Updated"
              : "Item Added to Inventory",
            description: currentItem
              ? "The inventory item has been successfully updated."
              : "A new inventory item has been added.",
            color: "success",
            variant: "flat",
            radius: "md",
            icon: "success",
          });
        }}
      />
    </div>
  );
}
