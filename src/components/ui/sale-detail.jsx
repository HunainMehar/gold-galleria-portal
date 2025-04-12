"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Spinner,
} from "@heroui/react";
import {
  Receipt,
  User,
  Phone,
  Calendar,
  FileText,
  DollarSign,
  Printer,
  Image as ImageIcon,
} from "lucide-react";

export default function SaleDetail({ isOpen, onOpenChange, sale, loading }) {
  // Function to extract image URL from inventory item
  const getItemImage = (item) => {
    if (!item || !item.inventory || !item.inventory.images) return null;

    try {
      let imagesArray = item.inventory.images;

      // Parse images if it's a string
      if (typeof item.inventory.images === "string") {
        imagesArray = JSON.parse(item.inventory.images);
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

  // Format date in readable format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Function to print invoice
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalBody className="py-8">
            <div className="flex justify-center items-center">
              <Spinner color="primary" size="lg" />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (!sale) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          <span>Sale Invoice #{sale.invoice_number}</span>
        </ModalHeader>
        <ModalBody className="max-h-[80vh] overflow-y-auto">
          <div id="printable-invoice" className="space-y-6">
            {/* Invoice Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-xl font-bold">
                  Invoice #{sale.invoice_number}
                </h2>
                <div className="flex items-center gap-1 text-default-500 text-sm">
                  <Calendar size={14} />
                  <span>Date: {formatDate(sale.created_at)}</span>
                </div>
              </div>
              <div className="text-right mt-3 md:mt-0">
                <div className="text-xl font-bold">
                  ${sale.total_amount.toFixed(2)}
                </div>
                <div className="text-default-500 text-sm">
                  {sale.sale_items?.length || 0} Item
                  {sale.sale_items?.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            <Divider />

            {/* Customer Information */}
            <div>
              <h3 className="text-medium font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Customer Information
              </h3>
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-default-500">
                      Customer Name
                    </div>
                    <div className="font-medium">{sale.customer_name}</div>
                  </div>
                  {sale.customer_phone && (
                    <div>
                      <div className="text-sm text-default-500">
                        Phone Number
                      </div>
                      <div className="font-medium flex items-center gap-1">
                        <Phone size={14} />
                        {sale.customer_phone}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Items Sold */}
            <div>
              <h3 className="text-medium font-semibold mb-3 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                Items Sold
              </h3>
              <Table aria-label="Items in sale">
                <TableHeader>
                  <TableColumn>Item</TableColumn>
                  <TableColumn>Tag Number</TableColumn>
                  <TableColumn>Details</TableColumn>
                  <TableColumn>Price</TableColumn>
                </TableHeader>
                <TableBody>
                  {sale.sale_items?.map((item) => (
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
                            {item.inventory?.item?.name || "Unknown Item"}
                            {item.inventory?.item?.abbreviation &&
                              ` (${item.inventory.item.abbreviation})`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.inventory?.tag_number}</TableCell>
                      <TableCell>
                        {item.inventory?.karat && (
                          <span>{item.inventory.karat}K</span>
                        )}
                        {item.inventory?.net_weight && (
                          <span>
                            , {parseFloat(item.inventory.net_weight).toFixed(2)}
                            g
                          </span>
                        )}
                        {item.inventory?.pure_gold && (
                          <span>
                            , {parseFloat(item.inventory.pure_gold).toFixed(2)}g
                            pure gold
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ${parseFloat(item.price).toFixed(2)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Additional Notes */}
            {sale.notes && (
              <div>
                <h3 className="text-medium font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Notes
                </h3>
                <Card className="p-4">
                  <p>{sale.notes}</p>
                </Card>
              </div>
            )}

            {/* Total Summary */}
            <Card className="p-4 mt-6">
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">Total Amount:</div>
                <div className="text-xl font-bold flex items-center gap-1">
                  <DollarSign size={18} />
                  {sale.total_amount.toFixed(2)}
                </div>
              </div>
            </Card>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={() => onOpenChange(false)}
          >
            Close
          </Button>
          {/* <Button
            color="primary"
            onPress={handlePrint}
            startContent={<Printer size={16} />}
          >
            Print Invoice
          </Button> */}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
