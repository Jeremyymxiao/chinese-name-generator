import { ReactNode } from "react";
import { Sidebar } from "@/types/blocks/sidebar";
import SidebarNav from "@/components/dashboard/sidebar/nav";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/icon";

export default function DashboardLayout({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar?: Sidebar;
}) {
  return (
    <div className="container md:max-w-7xl py-8 mx-auto">
      <div className="w-full space-y-6 p-4 pb-16 block">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            {/* Brand */}
            {sidebar?.brand && (
              <div className="mb-8">
                <Link href={sidebar.brand.url ?? "/"} className="flex items-center space-x-2">
                  {sidebar.brand.logo && sidebar.brand.logo.src && sidebar.brand.logo.alt && (
                    <Image
                      src={sidebar.brand.logo.src}
                      alt={sidebar.brand.logo.alt}
                      width={32}
                      height={32}
                    />
                  )}
                  <span className="font-semibold">{sidebar.brand.title}</span>
                </Link>
              </div>
            )}

            {/* Navigation */}
            {sidebar?.nav?.items && (
              <div className="mb-8">
                <SidebarNav items={sidebar.nav.items} />
              </div>
            )}

            {/* Social Links */}
            {sidebar?.social?.items && (
              <div className="flex flex-wrap gap-2">
                {sidebar.social.items.map((item, index) => (
                  <Link
                    key={index}
                    href={item.url ?? "#"}
                    target={item.target}
                    className="p-2 hover:bg-muted rounded-md"
                  >
                    {item.icon && <Icon name={item.icon} className="w-4 h-4" />}
                    <span className="sr-only">{item.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </aside>
          <div className="flex-1 lg:max-w-full">{children}</div>
        </div>
      </div>
    </div>
  );
} 