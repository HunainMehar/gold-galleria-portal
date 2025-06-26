"use client";

import { useEffect, useState, useRef } from "react";
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
  Select,
  SelectItem,
} from "@heroui/react";
import { inventoryApi, itemApi } from "@/lib/supabase/client";
import InventoryForm from "@/components/ui/inventory-form";
import PrintableTag from "@/components/ui/printable-tag";
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
  Printer,
  Package,
  X,
} from "lucide-react";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [printingItem, setPrintingItem] = useState(null);
  const [isPrintView, setIsPrintView] = useState(false);
  const [items, setItems] = useState([]);
  // Change state to hold a Set, initialized with 'all' as the default selected key
  const [selectedItemFilter, setSelectedItemFilter] = useState(
    new Set(["all"])
  );
  const printRef = useRef();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const itemsPerPage = 10;

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getAllInventory("available"); // Only fetch available items
      setInventory(data);
      // Pass the actual string value for filtering, converting from the Set
      const currentFilterKey = selectedItemFilter.values().next().value;
      applyFilters(
        data,
        searchTerm,
        currentFilterKey === "all" ? "" : currentFilterKey
      );
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

  const fetchItems = async () => {
    try {
      const data = await itemApi.getAllItems();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchItems();
  }, []);

  useEffect(() => {
    // Get the actual selected key string from the Set for filtering
    const currentFilterKey = selectedItemFilter.values().next().value;
    applyFilters(
      inventory,
      searchTerm,
      currentFilterKey === "all" ? "" : currentFilterKey
    );
  }, [searchTerm, selectedItemFilter, inventory]); // Added 'inventory' dependency as applyFilters uses it

  const applyFilters = (data, search, itemFilter) => {
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

    // Filter only if itemFilter is not empty or 'all'
    if (itemFilter && itemFilter !== "all") {
      filtered = filtered.filter(
        (item) => String(item.item_id) === String(itemFilter)
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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedItemFilter(new Set(["all"])); // Reset to 'all' for the Select component
  };

  const handlePrintTag = (item) => {
    setPrintingItem(item);
    setIsPrintView(true);

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Tag - ${item.tag_number}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              width: 100vw;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
              font-family: Arial, sans-serif;
            }
            
            .jewelry-tag {
              width: 25mm;
              height: 50mm;
              background: white;
              color: black;
              border: 1px solid #000;
              padding: 1mm;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              box-sizing: border-box;
            }
            
            .tag-number {
              font-size: 7px;
              font-weight: bold;
              margin-bottom: 0.5mm;
              text-align: left;
            }
            
            .tag-detail {
              display: flex;
              justify-content: space-between;
              font-size: 6px;
              line-height: 1.1;
              margin-bottom: 0.2mm;
            }
            
            .tag-label {
              font-weight: normal;
            }
            
            .tag-value {
              font-weight: normal;
            }
            
            @media print {
              body {
                width: 100%;
                height: 100%;
              }
              .jewelry-tag {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="jewelry-tag">
            <div class="tag-number">
              ${item.tag_number}
            </div>
            
            <div class="tag-detail">
              <span class="tag-label">Nw</span>
              <span class="tag-value">${parseFloat(item.net_weight || 0).toFixed(3)}</span>
            </div>
            
            <div class="tag-detail">
              <span class="tag-label">Pw</span>
              <span class="tag-value">${parseFloat(item.polish_weight || 0).toFixed(3)}</span>
            </div>
            
            <div class="tag-detail">
              <span class="tag-label">Tw</span>
              <span class="tag-value">${parseFloat(item.total_weight || 0).toFixed(3)}</span>
            </div>
            
            <div class="tag-detail">
              <span class="tag-label">Sw</span>
              <span class="tag-value">${parseFloat(item.stone_weight || 0).toFixed(3)}</span>
            </div>
            
            <div class="tag-detail">
              <span class="tag-label">Bdw</span>
              <span class="tag-value">0.00</span>
            </div>
            
            <div class="tag-detail">
              <span class="tag-label">Qty</span>
              <span class="tag-value">${item.no_of_pieces || item.quantity || 1}</span>
            </div>
            
            <div class="tag-detail">
              <span class="tag-label">Kt</span>
              <span class="tag-value">${item.karat}</span>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for the content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setPrintingItem(null);
        setIsPrintView(false);
      }, 500);
    };
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

  return (
    <div>
      {/* Hidden print component for fallback */}
      {isPrintView && printingItem && (
        <div style={{ display: "none" }}>
          <PrintableTag item={printingItem} />
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="flex gap-2">
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
        <Select
          placeholder="Filter by item"
          // selectedKeys expects a Set of keys. Pass the state directly.
          selectedKeys={selectedItemFilter}
          // Use onSelectionChange for selecting items, it returns a Set.
          onSelectionChange={(keys) => {
            setSelectedItemFilter(keys);
          }}
          startContent={<Package size={18} className="text-default-400" />}
          className="md:w-64"
        >
          {/* Key for "All Items" must be unique and consistent with initial state */}
          <SelectItem key="all" value="all">
            All Items
          </SelectItem>
          {items.map((item) => (
            // Ensure item.id is a string if it's a number, for consistency with Set keys
            <SelectItem key={String(item.id)} value={String(item.id)}>
              {item.name}
              {item.abbreviation && ` (${item.abbreviation})`}
            </SelectItem>
          ))}
        </Select>
        {/* Check if searchTerm has a value or if selectedItemFilter is not 'all' */}
        {(searchTerm ||
          (selectedItemFilter.size > 0 && !selectedItemFilter.has("all"))) && (
          <Button
            variant="flat"
            color="default"
            onPress={clearFilters}
            startContent={<X size={18} />}
          >
            Clear
          </Button>
        )}
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
          <div className="flex items-center gap-2">
            <span>Inventory Items</span>
            {/* Show "Filtered" chip if searchTerm or if a specific item is selected */}
            {(searchTerm ||
              (selectedItemFilter.size > 0 &&
                !selectedItemFilter.has("all"))) && (
              <Chip size="sm" color="primary" variant="flat">
                Filtered
              </Chip>
            )}
          </div>
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
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            onPress={() => handleEditInventory(item)}
                            startContent={<Edit size={16} />}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            onPress={() => handlePrintTag(item)}
                            startContent={<Printer size={16} />}
                          >
                            Print
                          </Button>
                        </div>
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
