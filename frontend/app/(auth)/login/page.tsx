"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login, googleLogin } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            await login({ username: email, password });
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = { backgroundColor: "#333", color: "white", borderColor: "transparent" };

    return (
        <div className="relative min-h-screen w-full bg-black md:bg-opacity-50 transition-all duration-500">
            {/* Background Image (Netflix Style) */}
            {/* Background Image (Netflix Style) - REMOVED per user request for pure black */}
            <div className="hidden md:block absolute inset-0 z-0 bg-black" />

            {/* Gradient Overlay for Mobile */}
            <div className="md:hidden absolute inset-0 bg-black z-0" />

            {/* Navbar Placeholder / Logo */}
            <div className="relative z-10 px-4 py-4 md:px-12 md:py-6 flex justify-between items-center">
                <Link href="/" className="text-red-600 text-3xl md:text-5xl font-bold tracking-tighter uppercase cursor-pointer">
                    NETFLIX
                </Link>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex justify-center items-center min-h-[calc(100vh-100px)] px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[450px] bg-black/75 p-8 md:p-16 rounded-md shadow-lg"
                >
                    <h1 className="text-3xl font-bold text-white mb-8">Sign In</h1>

                    {error && (
                        <div className="bg-[#e87c03] p-4 rounded mb-4 text-white text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div className="relative">
                                <Input
                                    type="email"
                                    placeholder="Email or phone number"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12 !bg-[#333] !border-none !text-white placeholder:text-gray-400 focus:!bg-[#454545] focus:ring-0 rounded"
                                />
                            </div>
                            <div className="relative">
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 !bg-[#333] !border-none !text-white placeholder:text-gray-400 focus:!bg-[#454545] focus:ring-0 rounded"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors mt-8 mb-4 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Sign In"}
                        </button>

                        <div className="flex justify-between items-center text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                                <input type="checkbox" id="remember" className="rounded bg-[#333] border-none focus:ring-0" />
                                <label htmlFor="remember">Remember me</label>
                            </div>
                            <a href="#" className="hover:underline">Need help?</a>
                        </div>
                    </form>

                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-px bg-gray-600 flex-1"></div>
                            <span className="text-gray-400 text-xs">OR</span>
                            <div className="h-px bg-gray-600 flex-1"></div>
                        </div>
                        {/* Google Button - Custom Style */}
                        <div className="w-full flex justify-center">
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    if (credentialResponse.credential) {
                                        try {
                                            setIsLoading(true);
                                            await googleLogin(credentialResponse.credential, "login");
                                        } catch (err: any) {
                                            setError(err.message || "Google Login failed");
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }
                                }}
                                onError={() => {
                                    setError("Google Login Failed");
                                }}
                                useOneTap={false} // OneTap can be intrusive on custom pages
                                theme="filled_black"
                                shape="pill"
                                width="100%"
                            />
                        </div>
                    </div>


                    <div className="mt-12 text-gray-400">
                        <p className="mb-2">
                            New to Netflix? <Link href="/register" className="text-white hover:underline">Sign up now.</Link>
                        </p>
                        <p className="text-xs">
                            This page is protected by Google reCAPTCHA to ensure you're not a bot. <a href="#" className="text-blue-500 hover:underline">Learn more.</a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
