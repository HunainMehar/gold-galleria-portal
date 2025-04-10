"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Accordion,
  AccordionItem,
  Button,
  Divider,
  Tooltip,
} from "@heroui/react";
import { SidebarItemType } from "./sidebar-items";

export default function Sidebar({
  items,
  defaultSelectedKey,
  onSelect,
  collapsed = false,
  className = "",
}) {
  const pathname = usePathname();

  if (collapsed) {
    // When collapsed, only show icons in a simplified layout
    return (
      <div
        className={`flex flex-col items-center justify-start ${className}`}
      >
        {items.map((section, index) => (
          <React.Fragment key={section.key}>
            {/* Add divider between sections */}
            {index > 0 && <Divider className="w-8 my-3" />}

            {/* Section items */}
            <div className="flex flex-col items-center gap-3 w-full">
              {section.items?.map((item) => (
                <CollapsedSidebarItem
                  key={item.key}
                  item={item}
                  isActive={
                    pathname === item.href || defaultSelectedKey === item.key
                  }
                  onSelect={onSelect}
                />
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Expanded sidebar with sections
  return (
    <div className={`flex flex-col gap-6 w-full ${className}`}>
      {items.map((section) => (
        <div key={section.key} className="flex flex-col gap-1.5 w-full">
          {/* Section title */}
          {section.title && (
            <p className="text-xs font-semibold text-default-500 px-3 py-1.5 uppercase tracking-wider">
              {section.title}
            </p>
          )}

          {/* Handle different section types */}
          {section.type === SidebarItemType.Nest ? (
            <Accordion
              defaultExpandedKeys={["1"]}
              isCompact
              className="px-0 py-0"
              itemClasses={{
                base: "py-0",
                title: "text-sm font-medium py-2",
                trigger:
                  "px-3 py-0 data-[hover=true]:bg-default-100 rounded-lg",
                indicator: "text-default-400",
                content: "pt-1 pb-1",
              }}
            >
              <AccordionItem
                key="1"
                aria-label={section.title}
                title={section.title}
                classNames={{
                  content: "pl-2",
                }}
              >
                <div className="flex flex-col gap-1 pl-2">
                  {section.items?.map((item) => (
                    <SidebarItem
                      key={item.key}
                      item={item}
                      isActive={
                        pathname === item.href ||
                        defaultSelectedKey === item.key
                      }
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              </AccordionItem>
            </Accordion>
          ) : section.type === SidebarItemType.Divider ? (
            <Divider className="my-2" />
          ) : (
            <div className="flex flex-col gap-1 px-1">
              {section.items?.map((item) => (
                <SidebarItem
                  key={item.key}
                  item={item}
                  isActive={
                    pathname === item.href || defaultSelectedKey === item.key
                  }
                  onSelect={onSelect}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CollapsedSidebarItem({ item, isActive, onSelect }) {
  // Import the icon dynamically
  const IconComponent = item.icon;

  // Create tooltip content that includes badge if present
  const tooltipContent = (
    <div className="flex items-center gap-2">
      <span>{item.title}</span>
      {item.badge && (
        <span className="bg-primary/20 text-primary text-xs px-1.5 rounded-full">
          {item.badge}
        </span>
      )}
      {item.endContent && <span className="scale-90">{item.endContent}</span>}
    </div>
  );

  return (
    <Tooltip content={tooltipContent} placement="right">
      <div className="relative">
        <Button
          as={Link}
          href={item.href}
          onClick={() => onSelect?.(item.key)}
          isIconOnly
          color={isActive ? "primary" : "default"}
          variant={isActive ? "flat" : "light"}
          className="mb-3 mx-auto relative"
          size="sm"
        >
          {item.startContent ? (
            item.startContent
          ) : IconComponent ? (
            <IconComponent
              size={20}
              className={
                isActive ? "text-primary-foreground" : "text-default-500"
              }
            />
          ) : (
            <span className="w-5 h-5" />
          )}

          {/* Badge indicator for collapsed view */}
          {item.badge && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">
              {item.badge}
            </span>
          )}
        </Button>
      </div>
    </Tooltip>
  );
}

function SidebarItem({ item, isActive, onSelect }) {
  // Import the icon dynamically
  const IconComponent = item.icon;

  return (
    <Button
      as={Link}
      href={item.href}
      onClick={() => onSelect?.(item.key)}
      fullWidth
      color={isActive ? "primary" : "default"}
      variant={isActive ? "flat" : "light"}
      className={`justify-start w-full h-9 px-3 ${isActive ? "font-medium" : "font-normal text-default-600"}`}
      startContent={
        item.startContent ? (
          item.startContent
        ) : IconComponent ? (
          <IconComponent
            size={18}
            className={`mr-2 flex-shrink-0 ${isActive ? "text-primary-foreground" : "text-default-500"}`}
          />
        ) : (
          <span className="w-4 h-4 mr-2 flex-shrink-0" />
        )
      }
      endContent={
        item.endContent ||
        (item.badge ? (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-default-100 px-1.5 text-xs font-medium">
            {item.badge}
          </span>
        ) : null)
      }
      size="sm"
    >
      <span className="truncate">{item.title}</span>
    </Button>
  );
}
