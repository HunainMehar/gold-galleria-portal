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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  Spinner,
  addToast,
  Chip,
} from "@heroui/react";
import { itemApi } from "@/lib/supabase/client";
import ItemForm from "@/components/ui/item-form";
import { PlusCircle, Edit, MoreVertical } from "lucide-react";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentItem, setCurrentItem] = useState(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await itemApi.getAllItems();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
      addToast({
        title: "Failed to fetch items",
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
    fetchItems();
  }, []);

  const handleAddItem = () => {
    setCurrentItem(null);
    onOpen();
  };

  const handleEditItem = (item) => {
    setCurrentItem(item);
    onOpen();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Items</h1>
        <Button
          color="primary"
          onPress={handleAddItem}
          startContent={<PlusCircle size={18} />}
        >
          Add Item
        </Button>
      </div>

      <Card>
        <CardHeader>All Items</CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner color="primary" size="lg" />
            </div>
          ) : (
            <Table aria-label="Items table">
              <TableHeader>
                <TableColumn>Name</TableColumn>
                <TableColumn>Abbreviation</TableColumn>
                <TableColumn>Created At</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No items found">
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      {item.abbreviation ? (
                        <Chip size="sm" variant="flat" color="primary">
                          {item.abbreviation}
                        </Chip>
                      ) : (
                        <span className="text-default-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(item.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => handleEditItem(item)}
                          startContent={<Edit size={16} />}
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <ItemForm
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        item={currentItem}
        onSuccess={() => {
          fetchItems();
          addToast({
            title: currentItem ? "Item Updated" : "Item Created",
            description: currentItem
              ? "The item has been successfully updated."
              : "A new item has been added.",
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
