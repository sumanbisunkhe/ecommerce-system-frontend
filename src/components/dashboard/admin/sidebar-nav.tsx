"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fascinate, Funnel_Sans } from "next/font/google"

import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  ClipboardList,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  LayoutList
} from "lucide-react"

const fascinate = Fascinate({
  subsets: ["latin"],
  weight: "400",
})

const funnelSans = Funnel_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

interface AdminSidebarProps {
  onCollapse?: (collapsed: boolean) => void;
}

const navigation = [
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: LayoutDashboard,
    description: "Performance metrics"
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Customer management"
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: LayoutList,
    description: "Categories management"
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: ShoppingBag,
    description: "Inventory control"
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ClipboardList,
    description: "Order tracking"
  },
]

export default function AdminSidebar({ onCollapse }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const handleCollapseToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapse?.(newState);
  }

  return (
    <>
      <aside
        style={{
          width: isCollapsed ? '80px' : '256px',
        }}
        className="fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out transform lg:translate-x-0 shadow-xl border-r border-gray-100 bg-white"
      >
        <div className="flex h-full flex-col relative">
          {/* Header Section */}
          <div className="flex h-20 shrink-0 items-center justify-between px-6 border-b border-gray-100">
            <Link
              href="/admin/analytics"
              className={`flex items-center transition-all duration-300 ${isCollapsed ? "justify-center w-full" : "space-x-3"}`}
            >

              {!isCollapsed && (
                <a href="/admin/analytics">
                  <div className="flex items-center gap-2">
                    <span
                      className={`
                      ${fascinate.className}
                      text-blue-700 font-extrabold tracking-tight
                      text-md sm:text-1xl lg:text-2xl
                      leading-none select-none
                    `}
                      style={{
                        letterSpacing: '-0.02em',
                      }}
                    >
                      HotShop<span className="text-pink-500">.com</span>
                    </span>
                  </div>
                </a>

              )}
            </Link>

            <button
              onClick={handleCollapseToggle}
              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300 group border border-gray-200"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4 text-gray-600 group-hover:text-gray-900 transition-colors duration-300" />
              ) : (
                <PanelLeftClose className="h-4 w-4 text-gray-600 group-hover:text-gray-900 transition-colors duration-300" />
              )}
            </button>
          </div>

          {/* Navigation Section */}
          <nav className="flex flex-1 flex-col px-4 py-6 space-y-1 overflow-y-auto">

            <ul role="list" className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`group relative flex items-center rounded-lg px-3 py-3 transition-all duration-200 overflow-hidden
                        ${isActive
                          ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }
                      `}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" />
                      )}

                      <item.icon
                        className={`h-5 w-5 shrink-0 transition-transform duration-200 z-10
                          ${isActive ? "text-blue-600 scale-105" : "text-gray-500 group-hover:text-gray-700"}
                        `}
                      />

                      {!isCollapsed && (
                        <div className="ml-3 flex-1 min-w-0">
                          <p className={`${funnelSans.className} text-sm font-semibold tracking-wide transition-all duration-200`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {item.description}
                          </p>
                        </div>
                      )}

                      {!isCollapsed && isActive && (
                        <ChevronRight className="h-4 w-4 text-blue-500 ml-auto" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>

          </nav>
        </div>

        {/* Collapsed tooltips */}
        {isCollapsed && (
          <div className="absolute left-full top-0 ml-1">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="absolute bg-gray-900 text-white px-2 py-1.5 rounded-md text-xs font-medium shadow-lg border border-gray-200 transform transition-all duration-150 opacity-0 pointer-events-none"
                style={{
                  top: `calc(120px + ${navigation.indexOf(item) * 56}px)`,
                  opacity: hoveredItem === item.name ? 1 : 0,
                  transform: `translateY(${hoveredItem === item.name ? 0 : -8}px)`,
                }}
              >
                {item.name}
                <div className="absolute left-0 top-1/2 -ml-1 w-1.5 h-1.5 bg-gray-900 rotate-45 -translate-y-1/2"></div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </>
  )
}