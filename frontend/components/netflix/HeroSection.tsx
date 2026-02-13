"use client";

import { Play, Info } from "lucide-react";
import { Content } from "@/types";

interface HeroSectionProps {
    content: Content | null;
    onOpenModal: (content: Content) => void;
}

export function HeroSection({ content, onOpenModal }: HeroSectionProps) {
    if (!content) return null;

    console.log("Hero Section - image_url:", content.image_url, "title:", content.title);

    return (
        <div className="relative flex flex-col space-y-2 py-16 md:space-y-4 lg:h-[65vh] lg:justify-end lg:pb-12">
            {/* Background Image */}
            {content.image_url && (
                <div
                    className="absolute inset-0 h-[95vh] w-full"
                    style={{
                        backgroundImage: `url(${content.image_url})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center top',
                        backgroundRepeat: 'no-repeat',
                        zIndex: 0
                    }}
                />
            )}
            {/* Gradient Overlay */}
            <div
                className="absolute inset-0 h-[95vh] w-full bg-gradient-to-b from-black/30 via-transparent to-[#141414]"
                style={{ zIndex: 1 }}
            />

            {/* Content - needs higher z-index */}
            <div className="relative z-10">
                <h1 className="text-2xl font-bold text-white md:text-4xl lg:text-7xl px-4 md:px-10">
                    {content.title}
                </h1>
                <p className="max-w-xs text-xs text-shadow-md text-white md:max-w-lg md:text-lg lg:max-w-2xl px-4 md:px-10">
                    {content.description?.slice(0, 150)}...
                </p>

                <div className="flex space-x-3 px-4 md:px-10 mt-4">
                    <button
                        className="bannerButton bg-white text-black hover:bg-gray-200 flex items-center gap-2 rounded px-5 py-1.5 md:py-2.5 md:px-8 font-bold transition"
                        onClick={() => window.location.href = `/watch/${content.id}`}
                    >
                        <Play className="h-4 w-4 text-black md:h-7 md:w-7" fill="black" />
                        Play
                    </button>
                    <button
                        className="bannerButton bg-[gray]/70 text-white hover:bg-[gray]/40 flex items-center gap-2 rounded px-5 py-1.5 md:py-2.5 md:px-8 font-bold transition opacity-80"
                        onClick={() => onOpenModal(content)}
                    >
                        <Info className="h-4 w-4 md:h-7 md:w-7" />
                        More Info
                    </button>
                </div>
            </div>
        </div>
    );
}
