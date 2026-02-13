"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { userApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Content } from "@/types";

interface MyListContextType {
    myList: Content[];
    myListIds: Set<number>;
    addToMyList: (content: Content) => Promise<void>;
    removeFromMyList: (contentId: number) => Promise<void>;
    isLoading: boolean;
}

const MyListContext = createContext<MyListContextType | undefined>(undefined);

export function MyListProvider({ children }: { children: ReactNode }) {
    const { user, token } = useAuth();
    const [myList, setMyList] = useState<Content[]>([]);
    const [myListIds, setMyListIds] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user && token) {
            fetchList();
        } else {
            setMyList([]);
            setMyListIds(new Set());
        }
    }, [user, token]);

    const fetchList = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const list = await userApi.getMyList(token);
            setMyList(list);
            setMyListIds(new Set(list.map(c => c.id)));
        } catch (error) {
            console.error("Failed to fetch my list", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addToMyList = async (content: Content) => {
        if (!token) return;
        // Optimistic update
        const newSet = new Set(myListIds);
        newSet.add(content.id);
        setMyListIds(newSet);
        setMyList([...myList, content]);

        try {
            await userApi.addToList(token, content.id);
        } catch (error) {
            console.error("Failed to add to list", error);
            // Revert
            fetchList();
        }
    };

    const removeFromMyList = async (contentId: number) => {
        if (!token) return;
        // Optimistic update
        const newSet = new Set(myListIds);
        newSet.delete(contentId);
        setMyListIds(newSet);
        setMyList(myList.filter(c => c.id !== contentId));

        try {
            await userApi.removeFromList(token, contentId);
        } catch (error) {
            console.error("Failed to remove from list", error);
            // Revert
            fetchList();
        }
    };

    return (
        <MyListContext.Provider value={{ myList, myListIds, addToMyList, removeFromMyList, isLoading }}>
            {children}
        </MyListContext.Provider>
    );
}

export function useMyList() {
    const context = useContext(MyListContext);
    if (context === undefined) {
        throw new Error("useMyList must be used within a MyListProvider");
    }
    return context;
}