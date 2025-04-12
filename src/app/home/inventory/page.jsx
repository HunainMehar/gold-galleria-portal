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
  Chip,
  Tooltip,
} from "@heroui/react";
import { inventoryApi } from "@/lib/supabase/client";
import InventoryForm from "@/components/ui/inventory-form";
import {
  PlusCircle,
  Edit,
  Search,
  Tag,
  Image as ImageIcon,
  Filter,
  SlidersHorizontal,
  Download,
  FileText,
  Hash,
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

  const handleViewDetails = (item) => {
    // This could be expanded in the future to show a detailed view
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

  // Calculate total counts and weights
  const inventorySummary = filteredInventory.reduce(
    (summary, item) => {
      const pieces = item.no_of_pieces || item.quantity || 0;
      summary.totalPieces += pieces;
      summary.totalNetWeight += parseFloat(item.net_weight) || 0;
      summary.totalGoldWeight += parseFloat(item.pure_gold) || 0;
      return summary;
    },
    { totalPieces: 0, totalNetWeight: 0, totalGoldWeight: 0 }
  );

  // Get pieces count, handling both no_of_pieces and quantity fields during transition
  const getPiecesCount = (item) => {
    return item.no_of_pieces !== undefined
      ? item.no_of_pieces
      : item.quantity || 0;
  };

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredInventory.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Function to export inventory data to CSV
  const exportToCSV = () => {
    try {
      // Prepare CSV headers and data
      const headers = [
        "Tag Number",
        "Item",
        "Description",
        "No. of Pieces",
        "Karat",
        "Net Weight (g)",
        "Total Weight (g)",
        "Pure Gold (g)",
        "Status",
        "Date Added",
      ];

      // Map inventory data to CSV rows
      const rows = filteredInventory.map((item) => [
        item.tag_number || "",
        (item.item?.name || "") +
          (item.item?.abbreviation ? ` (${item.item.abbreviation})` : ""),
        item.description || "",
        getPiecesCount(item),
        item.karat || "",
        item.net_weight ? parseFloat(item.net_weight).toFixed(3) : "0.000",
        item.total_weight ? parseFloat(item.total_weight).toFixed(3) : "0.000",
        item.pure_gold ? parseFloat(item.pure_gold).toFixed(3) : "0.000",
        item.status || "available",
        new Date(item.created_at).toLocaleDateString(),
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((cell) =>
              // Handle cells that might need quotes (if they contain commas, quotes, or newlines)
              typeof cell === "string" &&
              (cell.includes(",") || cell.includes('"') || cell.includes("\n"))
                ? `"${cell.replace(/"/g, '""')}"`
                : cell
            )
            .join(",")
        ),
      ].join("\n");

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `inventory_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast({
        title: "Export Successful",
        description: "Inventory data has been exported to CSV",
        color: "success",
        variant: "flat",
        radius: "md",
        icon: "success",
      });
    } catch (error) {
      console.error("Error exporting inventory data:", error);
      addToast({
        title: "Export Failed",
        description: "There was a problem exporting the inventory data",
        color: "danger",
        variant: "flat",
        radius: "md",
        icon: "error",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="flex gap-2">
          {/* <Tooltip content="Export inventory to CSV">
            <Button
              variant="flat"
              color="secondary"
              onPress={exportToCSV}
              startContent={<Download size={18} />}
              isDisabled={filteredInventory.length === 0}
            >
              Export
            </Button>
          </Tooltip> */}
          <Button
            color="primary"
            onPress={handleAddInventory}
            startContent={<PlusCircle size={18} />}
          >
            Add Item
          </Button>
        </div>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Total Items</p>
                <p className="text-xl font-semibold">
                  {filteredInventory.length}
                </p>
              </div>
              <FileText size={24} className="text-primary opacity-70" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Total Pieces</p>
                <p className="text-xl font-semibold">
                  {inventorySummary.totalPieces}
                </p>
              </div>
              <Hash size={24} className="text-primary opacity-70" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Total Gold Weight</p>
                <p className="text-xl font-semibold">
                  {inventorySummary.totalGoldWeight.toFixed(3)} g
                </p>
              </div>
              <Tag size={24} className="text-primary opacity-70" />
            </div>
          </CardBody>
        </Card>
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
                  <TableColumn>No. of Pieces</TableColumn>
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
                      <TableCell>{getPiecesCount(item)}</TableCell>
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
