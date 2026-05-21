"use client"

import { useState, useEffect, createContext, useContext } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { ChartColumn, Cpu, BookOpenText, FileStack, Menu, X, CheckCircle } from "lucide-react"

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
    {
        name : "Verifikasi",
        href : "/verifikasi",
        icon : CheckCircle,
    }
]

// Create context for sidebar state
const SidebarContext = createContext<{
    isOpen: boolean | null
    isMobile: boolean
}>({
    isOpen: null,
    isMobile: false,
})

export const useSidebar = () => useContext(SidebarContext)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = router.pathname
    const [isOpen, setIsOpen] = useState<boolean | null>(null) // null = belum diinisialisasi
    const [isMobile, setIsMobile] = useState(false)

    // Detect screen size and set initial state
    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 768 // md breakpoint
            
            setIsMobile((prevMobile) => {
                // If switching from desktop to mobile, close sidebar if it's open
                if (!prevMobile && mobile) {
                    setIsOpen((prevOpen) => prevOpen ? false : prevOpen)
                }
                return mobile
            })
            
            // Set initial sidebar state based on screen size (only once)
            setIsOpen((prevOpen) => {
                if (prevOpen === null) {
                    return !mobile // true for desktop, false for mobile
                }
                return prevOpen
            })
        }

        checkScreenSize()
        window.addEventListener('resize', checkScreenSize)
        
        return () => window.removeEventListener('resize', checkScreenSize)
    }, []) // Only run once on mount

    // Close sidebar when route changes on mobile only
    useEffect(() => {
        if (isMobile && isOpen) {
            setIsOpen(false)
        }
    }, [pathname, isMobile, isOpen])

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isMobile && isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, isMobile])

    const toggleSidebar = () => {
        setIsOpen(!isOpen)
    }

    return (
        <SidebarContext.Provider value={{ isOpen, isMobile }}>
            {/* Hamburger Button - Visible on all screen sizes, toggles sidebar */}
            {/* On desktop when sidebar is closed, position button inside sidebar */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    toggleSidebar()
                }}
                className={`
                    fixed top-4 z-50 p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-all duration-300 ease-in-out
                    ${isOpen || isMobile ? 'left-4' : 'md:left-4'}
                `}
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                {isOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <Menu className="h-6 w-6" />
                )}
            </button>

            {/* Overlay - Visible only on mobile when sidebar is open */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsOpen(false)
                    }}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    fixed 
                    top-0 left-0
                    h-full
                    bg-slate-800
                    border-r-primary border-r
                    z-40
                    transition-all duration-300 ease-in-out
                    ${isOpen ? 'md:w-[200px] translate-x-0' : '-translate-x-full md:translate-x-0 md:w-[64px]'}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-full">
                    {/* Header - Hide on desktop when sidebar is closed */}
                    <div className={`p-6 ${!isOpen && !isMobile ? 'md:hidden' : ''}`}>
                        <h1 className="text-2xl font-bold text-white ml-8 text-sidebar-foreground">MENU</h1>
                    </div>
                    <nav 
                    className={`flex-1  space-y-2 ${isOpen || isMobile ? 'px-4 pt-4' : 'md:px-2 pt-16'}`}
                    >
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => {
                                        // Close sidebar only on mobile when navigating
                                        if (isMobile) {
                                            setIsOpen(false)
                                        }
                                    }}
                                    className={`
                                        gap-1
                                        flex text-white items-center  py-2 rounded-lg text-sm font-medium transition-colors
                                        ${isOpen || isMobile ? 'px-3 justify-start' : 'md:px-2 md:justify-center'}
                                        ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
                                    `}
                                    title={!isOpen && !isMobile ? item.name : undefined}
                                >
                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                    <span className={`${!isOpen && !isMobile ? 'md:hidden' : ''}`}>
                                        {item.name}
                                    </span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>
            {children}
        </SidebarContext.Provider>
    )
}
