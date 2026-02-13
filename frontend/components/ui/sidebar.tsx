"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    Settings,
    LogOut,
    Play,
    History,
    User,
    HelpCircle,
    Plus
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const routes = [
    {
        label: "Home",
        icon: Play,
        href: "/dashboard",
        color: "text-red-500",
    },
    {
        label: "Add Content",
        icon: Plus,
        href: "/dashboard/admin/add",
        color: "text-green-500",
    },
    // {
    //     label: "Settings",
    //     icon: Settings,
    //     href: "/dashboard/settings",
    //     color: "text-gray-500",
    // },

    {
        label: "History",
        icon: History,
        href: "#history",
        color: "text-zinc-400",
        dummy: true,
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
        color: "text-zinc-400",
        dummy: true,
    },
    {
        label: "My Account",
        icon: User,
        href: "#account",
        color: "text-zinc-400",
        dummy: true,
    },
    {
        label: "Help",
        icon: HelpCircle,
        href: "#help",
        color: "text-zinc-400",
        dummy: true,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-black text-white pt-16">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <h1 className="text-3xl font-bold text-red-600">
                        NETFLIX
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium transition",
                                // Active state
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
                                // Dummy state styling
                                // @ts-ignore
                                route.dummy ? "cursor-pointer hover:text-white hover:bg-white/10" : "cursor-pointer hover:text-white hover:bg-white/10"
                            )}
                            // @ts-ignore
                            onClick={(e) => route.dummy && e.preventDefault()}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <div onClick={logout} className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-red-400 hover:bg-white/10 rounded-lg transition text-zinc-400">
                    <div className="flex items-center flex-1">
                        <LogOut className="h-5 w-5 mr-3 text-red-500" />
                        Logout
                    </div>
                </div>
            </div>
        </div >
    );
}
