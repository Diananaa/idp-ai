
import { AppSidebar } from "./app-sidebar"
import { Header } from "./header"


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body>
                <div className="flex h-screen ">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <Header />
                        <main className="flex-1 overflow-auto p-6">{children}</main>
                    </div>
                </div>
            </body>
        </html>
    )
}
