"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fascinate } from "next/font/google"
import { Funnel_Sans } from "next/font/google"

import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  ClipboardList,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"

const fascinate = Fascinate({
  subsets: ["latin"],
  weight: "400",
})

const funnelSans = Funnel_Sans({
  subsets: ["latin"],
  weight: "400",
})

interface AdminSidebarProps {
  user: any;
  onCollapse?: (collapsed: boolean) => void;
}

const navigation = [
  { name: "Analytics", href: "/admin/analytics", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Products", href: "/admin/products", icon: ShoppingBag },
  { name: "Orders", href: "/admin/orders", icon: ClipboardList },
]

export default function AdminSidebar({ user, onCollapse }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out ${isCollapsed ? "w-16" : "w-64"}`}
    >
      <div className="flex h-full flex-col bg-white border-r border-gray-200 shadow-sm">
        {/* Header Section */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-gray-100">
          <Link
            href="/admin/analytics"
            className={`flex items-center transition-all duration-200 ${isCollapsed ? "justify-center w-full" : ""}`}
          >
            <span
              className={`${fascinate.className} text-black transition-all duration-200 tracking-widest text-3xl font-bold`}
            >
              {!isCollapsed && "HoTsHoP"}
            </span>
          </Link>

          <button
            onClick={() => {
              const newState = !isCollapsed;
              setIsCollapsed(newState);
              onCollapse?.(newState);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors duration-200" />
            ) : (
              <PanelLeftClose className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors duration-200" />
            )}
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex flex-1 flex-col px-3 py-4">
          <ul role="list" className="flex flex-1 flex-col gap-y-1">
            <li>
              <ul role="list" className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        group flex items-center gap-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200
                        ${pathname === item.href
                          ? "text-black font-semibold"
                          : "text-black hover:text-black hover:bg-gray-50"
                        }
                      `}
                    >
                      <item.icon
                        className={`h-5 w-5 shrink-0 transition-all duration-200 ${
                          pathname === item.href 
                            ? "text-black fill-orange-500 scale-10" 
                            : "text-black group-hover:text-black"
                        }`}
                      />

                      {!isCollapsed && (
                        <span className={`${funnelSans.className} truncate font-medium tracking-wide`}>
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
