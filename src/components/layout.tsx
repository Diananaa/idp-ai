"use client"

import { SidebarProvider, useSidebar } from "./app-sidebar"
import { Header } from "./header"

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isOpen } = useSidebar()
    
    return (
        <>
            <div 
                className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out bg-slate-900 ${
                    isOpen ? 'md:ml-[200px]' : 'md:ml-[64px]'
                }`}
            >
                <Header />
                <main className="flex-1 overflow-auto p-6 md:pl-4 bg-slate-900">{children}</main>
            </div>
        </>
    )
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <SidebarProvider>
            <div className="flex h-screen">
                <LayoutContent>{children}</LayoutContent>
            </div>
        </SidebarProvider>
    )
}
