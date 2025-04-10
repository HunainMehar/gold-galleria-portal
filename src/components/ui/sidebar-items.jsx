import React from "react";
import { Chip } from "@heroui/react";
import {
  Home,
  FileText,
  Tag,
  BarChart2,
  CreditCard,
  HelpCircle,
  Users as UsersIcon,
} from "lucide-react";

// Define the SidebarItemType enum
export const SidebarItemType = {
  Nest: "nest",
  Link: "link",
  Divider: "divider",
};

// Enhanced admin items with better organization and visual hierarchy
export const adminItems = [
  {
    key: "overview",
    title: "Overview",
    type: SidebarItemType.Nest,
    items: [
      {
        key: "dashboard",
        href: "/home/dashboard",
        icon: Home,
        title: "Dashboard",
      },
      {
        key: "expenses",
        href: "/home/expenses",
        icon: FileText,
        title: "Expenses",
      },
      {
        key: "categories",
        href: "/home/categories",
        icon: Tag,
        title: "Categories",
      },
      // {
      //   key: "users",
      //   href: "/home/users",
      //   icon: UsersIcon,
      //   title: "Users",
      // },
      // {
      //   key: "reports",
      //   href: "/home/reports",
      //   icon: BarChart2,
      //   title: "Reports",
      //   endContent: (
      //     <Chip size="sm" variant="flat" color="primary" className="h-5 px-1.5">
      //       New
      //     </Chip>
      //   ),
      // },
    ],
  },
  // {
  //   key: "divider1",
  //   type: SidebarItemType.Divider,
  // },
  // {
  //   key: "billing",
  //   title: "Billing",
  //   type: SidebarItemType.Nest,
  //   items: [
  //     {
  //       key: "billing",
  //       href: "/home/billing",
  //       icon: CreditCard,
  //       title: "Billing",
  //       endContent: (
  //         <Chip size="sm" variant="flat" color="warning" className="h-5 px-1.5">
  //           Update
  //         </Chip>
  //       ),
  //     },
  //   ],
  // },
  // {
  //   key: "support",
  //   title: "Support",
  //   type: SidebarItemType.Nest,
  //   items: [
  //     {
  //       key: "help",
  //       href: "/home/help",
  //       icon: HelpCircle,
  //       title: "Help Center",
  //     },
  //   ],
  // },
];
