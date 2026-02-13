"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { MyListProvider } from "@/context/MyListContext";

function DashboardLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { isSidebarOpen, toggleSidebar } = useSidebar();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#000000] text-white">
                <div className="animate-pulse">Loading Analytics OS...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="h-full relative font-sans antialiased text-white bg-black">
            {/* Sidebar Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-[100] p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <div className={cn(
                "hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[90] bg-black border-r border-gray-800 transition-transform duration-300 ease-in-out",
                !isSidebarOpen && "-translate-x-full"
            )}>
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className={cn(
                "h-full transition-all duration-300 ease-in-out bg-black",
                isSidebarOpen ? "md:pl-72" : "md:pl-0"
            )}>
                {/* 
                   We remove the p-8 padding which might be causing white space or alignment issues with full-width heros.
                   The children (BrowseClient) handle their own padding/layout.
                */}
                <div className="h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <MyListProvider>
                <DashboardLayoutContent>{children}</DashboardLayoutContent>
            </MyListProvider>
        </SidebarProvider>
    );
}
