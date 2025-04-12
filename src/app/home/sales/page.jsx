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
  Chip,
  Avatar,
} from "@heroui/react";
import { salesApi } from "@/lib/supabase/client";
import SaleForm from "@/components/ui/sale-form";
import SaleDetail from "@/components/ui/sale-detail";
import {
  PlusCircle,
  Search,
  Receipt,
  Eye,
  Download,
  User,
  Phone,
  Calendar,
  DollarSign,
  Tag,
  Image as ImageIcon,
} from "lucide-react";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState(null);
  const [loadingSaleDetail, setLoadingSaleDetail] = useState(false);

  // Modals
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onOpenChange: onCreateOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onOpenChange: onDetailOpenChange,
  } = useDisclosure();

  const itemsPerPage = 10;

  // Fetch all sales
  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await salesApi.getAllSales();
      setSales(data);
      applyFilters(data, searchTerm);
    } catch (error) {
      console.error("Error fetching sales:", error);
      addToast({
        title: "Failed to fetch sales",
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
    fetchSales();
  }, []);

  // Apply search filters
  useEffect(() => {
    applyFilters(sales, searchTerm);
  }, [searchTerm]);

  const applyFilters = (data, search) => {
    let filtered = [...data];

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (sale) =>
          (sale.invoice_number &&
            sale.invoice_number.toLowerCase().includes(searchLower)) ||
          (sale.customer_name &&
            sale.customer_name.toLowerCase().includes(searchLower)) ||
          (sale.customer_phone && sale.customer_phone.includes(searchLower))
      );
    }

    setFilteredSales(filtered);
    setCurrentPage(1);
  };

  // View sale details
  const handleViewSale = async (saleId) => {
    setLoadingSaleDetail(true);
    try {
      const saleData = await salesApi.getSaleById(saleId);
      setSelectedSale(saleData);
      onDetailOpen();
    } catch (error) {
      console.error("Error fetching sale details:", error);
      addToast({
        title: "Failed to fetch sale details",
        description: error.message,
        color: "danger",
        variant: "flat",
        radius: "md",
        icon: "error",
      });
    } finally {
      setLoadingSaleDetail(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get count of items in a sale
  const getItemCount = (sale) => {
    return sale.sale_items?.length || 0;
  };

  // Export sales data to CSV
  const exportToCSV = () => {
    try {
      // Prepare CSV headers and data
      const headers = [
        "Invoice Number",
        "Date",
        "Customer Name",
        "Customer Phone",
        "Items Sold",
        "Total Amount ($)",
        "Notes",
      ];

      // Map sales data to CSV rows
      const rows = filteredSales.map((sale) => [
        sale.invoice_number || "",
        new Date(sale.created_at).toLocaleDateString(),
        sale.customer_name || "",
        sale.customer_phone || "",
        getItemCount(sale),
        parseFloat(sale.total_amount).toFixed(2),
        sale.notes ? sale.notes.replace(/,/g, ";").replace(/\n/g, " ") : "",
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
        `sales_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast({
        title: "Export Successful",
        description: "Sales data has been exported to CSV",
        color: "success",
        variant: "flat",
        radius: "md",
        icon: "success",
      });
    } catch (error) {
      console.error("Error exporting sales data:", error);
      addToast({
        title: "Export Failed",
        description: "There was a problem exporting the sales data",
        color: "danger",
        variant: "flat",
        radius: "md",
        icon: "error",
      });
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Calculate summary statistics
  const salesSummary = filteredSales.reduce(
    (summary, sale) => {
      summary.totalRevenue += parseFloat(sale.total_amount) || 0;
      summary.totalSales += 1;
      summary.totalItems += getItemCount(sale);
      return summary;
    },
    { totalRevenue: 0, totalSales: 0, totalItems: 0 }
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales</h1>
        <div className="flex gap-2">
          {/* <Button
            variant="flat"
            color="secondary"
            onPress={exportToCSV}
            startContent={<Download size={18} />}
            isDisabled={filteredSales.length === 0}
          >
            Export
          </Button> */}
          <Button
            color="primary"
            onPress={onCreateOpen}
            startContent={<PlusCircle size={18} />}
          >
            Create Sale
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search by invoice #, customer name or phone"
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
                <p className="text-sm text-default-500">Total Sales</p>
                <p className="text-xl font-semibold">
                  {salesSummary.totalSales}
                </p>
              </div>
              <Receipt size={24} className="text-primary opacity-70" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Items Sold</p>
                <p className="text-xl font-semibold">
                  {salesSummary.totalItems}
                </p>
              </div>
              <Tag size={24} className="text-primary opacity-70" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Total Revenue</p>
                <p className="text-xl font-semibold">
                  ${salesSummary.totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign size={24} className="text-primary opacity-70" />
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>Sales History</div>
          <div className="text-default-500 text-sm">
            {filteredSales.length} sale{filteredSales.length !== 1 ? "s" : ""}{" "}
            found
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner color="primary" size="lg" />
            </div>
          ) : (
            <>
              <Table aria-label="Sales table">
                <TableHeader>
                  <TableColumn>Invoice #</TableColumn>
                  <TableColumn>Date</TableColumn>
                  <TableColumn>Customer</TableColumn>
                  <TableColumn>Items</TableColumn>
                  <TableColumn>Total</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No sales records found">
                  {paginatedSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div className="font-medium">{sale.invoice_number}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-default-500" />
                          {formatDate(sale.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <User size={14} className="text-default-500" />
                            {sale.customer_name}
                          </div>
                          {sale.customer_phone && (
                            <div className="flex items-center gap-1 text-default-500 text-xs">
                              <Phone size={12} />
                              {sale.customer_phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="primary">
                          {getItemCount(sale)} item
                          {getItemCount(sale) !== 1 ? "s" : ""}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ${parseFloat(sale.total_amount).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="light"
                          color="primary"
                          onPress={() => handleViewSale(sale.id)}
                          startContent={<Eye size={16} />}
                        >
                          View
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

      {/* Create Sale Modal */}
      <SaleForm
        isOpen={isCreateOpen}
        onOpenChange={onCreateOpenChange}
        onSuccess={() => {
          fetchSales();
        }}
      />

      {/* Sale Detail Modal */}
      <SaleDetail
        isOpen={isDetailOpen}
        onOpenChange={onDetailOpenChange}
        sale={selectedSale}
        loading={loadingSaleDetail}
      />
    </div>
  );
}
