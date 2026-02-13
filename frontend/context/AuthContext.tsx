// keeps track if the user logged in or not who is the user

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, UserLogin, UserRegister } from "@/types";
import { authApi } from "@/lib/api";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: UserLogin) => Promise<void>;
    register: (data: UserRegister) => Promise<void>;
    logout: () => void;
    googleLogin: (token: string, mode?: "login" | "register") => Promise<void>;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function loadUser() {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const userData = await authApi.me(token);
                    setUser(userData);
                } catch (error) {
                    console.error("Failed to load user", error);
                    localStorage.removeItem("token");
                }
            }
            setLoading(false);
        }
        loadUser();
    }, []);

    const login = async (data: UserLogin) => {
        const response = await authApi.login(data);
        localStorage.setItem("token", response.access_token);
        const userData = await authApi.me(response.access_token);
        setUser(userData);
        router.push("/dashboard");
    };

    const register = async (data: UserRegister) => {
        await authApi.register(data);
        await login({ username: data.email, password: data.password });
    };

    const googleLogin = async (token: string, mode: "login" | "register" = "login") => {
        const response = await authApi.googleLogin(token, mode);
        localStorage.setItem("token", response.access_token);
        const userData = await authApi.me(response.access_token);
        setUser(userData);
        router.push("/dashboard");
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        router.push("/login"); // or /
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin, token: typeof window !== 'undefined' ? localStorage.getItem("token") : null }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
