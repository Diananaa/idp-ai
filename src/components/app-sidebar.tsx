"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChartColumn, Cpu, BookOpenText, FileStack } from "lucide-react"

const navigation = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: ChartColumn,
    },
    {
        name: "Processing",
        href: "/processor",
        icon: Cpu,
    },
      {
        name: "Documents",
        href: "/documents",
        icon: FileStack,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <div className="w-[200px] bg-slate-800 border-r-primary border-r ">
            <div className="flex flex-col h-full">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-white text-sidebar-foreground">MENU</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex text-white items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}
