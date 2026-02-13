"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");
    const { register, googleLogin } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            await register({ email, password, full_name: fullName });
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

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
                <Link href="/login" className="text-white font-medium hover:underline text-sm md:text-base">
                    Sign In
                </Link>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex justify-center items-center min-h-[calc(100vh-100px)] px-4 pb-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[450px] bg-black/75 p-8 md:p-12 rounded-md shadow-lg"
                >
                    <h1 className="text-3xl font-bold text-white mb-6">Sign Up</h1>

                    {error && (
                        <div className="bg-[#e87c03] p-4 rounded mb-4 text-white text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="h-12 !bg-[#333] !border-none !text-white placeholder:text-gray-400 focus:!bg-[#454545] focus:ring-0 rounded"
                                />
                            </div>
                            <div className="relative">
                                <Input
                                    type="email"
                                    placeholder="Email address"
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
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors mt-6 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Sign Up"}
                        </button>
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
                                            await googleLogin(credentialResponse.credential, "register");
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
                                useOneTap={false}
                                theme="filled_black"
                                shape="pill"
                                width="100%"
                                text="signup_with"
                            />
                        </div>
                    </div>


                    <div className="mt-8 text-gray-400 text-sm">
                        <p className="mb-2">
                            Already use Netflix? <Link href="/login" className="text-white hover:underline">Sign in now.</Link>
                        </p>
                        <p className="text-xs mt-4">
                            This page is protected by Google reCAPTCHA to ensure you're not a bot. <a href="#" className="text-blue-500 hover:underline">Learn more.</a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
