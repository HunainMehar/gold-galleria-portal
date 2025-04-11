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
  Chip,
  Input,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { inventoryApi } from "@/lib/supabase/client";
import InventoryForm from "@/components/ui/inventory-form";
import { PlusCircle, Edit, Search, Tag, Filter } from "lucide-react";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "available", "sold"
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const itemsPerPage = 10;

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getAllInventory();
      setInventory(data);
      applyFilters(data, searchTerm, statusFilter);
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

  // Apply filters when search term or status filter changes
  useEffect(() => {
    applyFilters(inventory, searchTerm, statusFilter);
  }, [searchTerm, statusFilter]);

  const applyFilters = (data, search, status) => {
    let filtered = [...data];

    // Apply status filter
    if (status !== "all") {
      filtered = filtered.filter((item) => item.status === status);
    }

    // Apply search filter
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
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleAddInventory = () => {
    setCurrentItem(null);
    onOpen();
  };

  const handleEditInventory = (item) => {
    setCurrentItem(item);
    onOpen();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatWeight = (weight) => {
    return parseFloat(weight).toFixed(3) + " g";
  };

  // Calculate pagination
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

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search by tag, name, or description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startContent={<Search size={18} className="text-default-400" />}
          className="flex-grow"
          clearable
        />

        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="flat"
              startContent={<Filter size={18} />}
              className="min-w-[140px]"
            >
              {statusFilter === "all"
                ? "All Status"
                : statusFilter === "available"
                  ? "Available"
                  : "Sold"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Status Filter"
            selectedKeys={[statusFilter]}
            selectionMode="single"
            onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0])}
          >
            <DropdownItem key="all">All Status</DropdownItem>
            <DropdownItem key="available">Available</DropdownItem>
            <DropdownItem key="sold">Sold</DropdownItem>
          </DropdownMenu>
        </Dropdown>
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
                  <TableColumn>Tag</TableColumn>
                  <TableColumn>Item</TableColumn>
                  <TableColumn>Net Weight</TableColumn>
                  <TableColumn>Total Weight</TableColumn>
                  <TableColumn>Karat</TableColumn>
                  <TableColumn>Pure Gold</TableColumn>
                  <TableColumn>Status</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No inventory items found">
                  {currentItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-primary" />
                          <span>{item.tag_number}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {item.item?.name || "Unknown Item"}
                          </div>
                          {item.item?.abbreviation && (
                            <div className="text-xs text-default-500">
                              {item.item.abbreviation}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatWeight(item.net_weight)}</TableCell>
                      <TableCell>{formatWeight(item.total_weight)}</TableCell>
                      <TableCell>{item.karat}K</TableCell>
                      <TableCell>{formatWeight(item.pure_gold)}</TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={
                            item.status === "available" ? "success" : "warning"
                          }
                          variant="flat"
                        >
                          {item.status === "available" ? "Available" : "Sold"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => handleEditInventory(item)}
                          startContent={<Edit size={16} />}
                          isDisabled={item.status === "sold"}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
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
              : "A new item has been added to the inventory.",
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
