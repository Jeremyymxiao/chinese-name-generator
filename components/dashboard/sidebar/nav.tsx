"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { NavItem } from "@/types/blocks/base";

interface SidebarNavProps {
  items: NavItem[];
}

export default function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <nav className="flex flex-col space-y-1">
      {items.map((item) => {
        const isActive = item.url ? pathname === item.url : false;
        const isExpanded = item.title ? expandedItems[item.title] : false;

        if (item.children) {
          return (
            <div key={item.title} className="space-y-1">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-muted"
                )}
                onClick={() => item.title && toggleExpand(item.title)}
              >
                {item.icon && (
                  <Icon name={item.icon} className="mr-2 h-4 w-4" />
                )}
                {item.title}
                <Icon
                  name={isExpanded ? "RiArrowUpSLine" : "RiArrowDownSLine"}
                  className="ml-auto h-4 w-4"
                />
              </Button>
              {isExpanded && (
                <div className="pl-4 space-y-1">
                  {item.children.map((child) => (
                    <Button
                      key={child.title}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        pathname === child.url && "bg-muted"
                      )}
                      asChild
                    >
                      <Link href={child.url || "#"}>
                        {child.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <Button
            key={item.title}
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isActive && "bg-muted"
            )}
            asChild
          >
            <Link href={item.url || "#"}>
              {item.icon && (
                <Icon name={item.icon} className="mr-2 h-4 w-4" />
              )}
              {item.title}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
} 