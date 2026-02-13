"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, ThumbsUp, ChevronDown, Check } from "lucide-react";
import { Content } from "@/types";
import { cn } from "@/lib/utils";
import { useMyList } from "@/context/MyListContext";

interface MovieCardProps {
    content: Content;
    onOpenModal?: (content: Content) => void;
    className?: string;
}

export function MovieCard({ content, onOpenModal, className }: MovieCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();
    const { myListIds, addToMyList, removeFromMyList } = useMyList();
    const isInList = myListIds.has(content.id);

    // Generate a consistent color based on title for placeholder
    const getColor = (str: string) => {
        const colors = [
            "bg-red-600",
            "bg-blue-600",
            "bg-green-600",
            "bg-purple-600",
            "bg-yellow-600",
            "bg-indigo-600",
            "bg-pink-600",
            "bg-teal-600",
        ];
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const bgColor = getColor(content.title);

    // Generate a consistent match percentage based on content ID
    const getMatchPercentage = (id: number) => {
        // Use a simple deterministic random-like function based on ID
        const seed = id * 12345;
        const x = Math.sin(seed) * 10000;
        // Range between 85% and 99%
        const result = Math.floor((x - Math.floor(x)) * (99 - 85) + 85);
        return `${result}%`;
    };

    const matchPercentage = getMatchPercentage(content.id);

    return (
        <div
            className={cn(
                "relative h-28 min-w-[180px] cursor-pointer md:h-36 md:min-w-[240px]",
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Thumbnail (Static) */}
            {content.image_url ? (
                <img
                    src={content.image_url}
                    alt={content.title}
                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                />
            ) : null}
            <div
                className={cn(
                    "absolute inset-0 rounded-md flex items-center justify-center p-2 text-center text-white font-bold text-sm select-none break-words px-4",
                    bgColor,
                    content.image_url ? "hidden" : ""
                )}
            >
                <span className="line-clamp-3">{content.title}</span>
            </div>

            {/* Hover Card (Animated) */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: 1, scale: 1.1, zIndex: 90 }}
                        exit={{ opacity: 0, scale: 1, transition: { duration: 0.1 } }}
                        transition={{ duration: 0.2, delay: 0.2 }}
                        className="absolute -top-[20%] left-[-10%] right-[-10%] -bottom-[20%] w-[120%] h-[140%] z-[90] origin-center shadow-lg rounded-md bg-[#141414]"
                        onClick={() => onOpenModal && onOpenModal(content)}
                    >
                        <div className="flex flex-col h-full w-full rounded-md shadow-xl bg-[#141414] overflow-hidden border border-gray-700">
                            {/* Image Area in Hover Card */}
                            {content.image_url ? (
                                <div className="h-32 w-full relative">
                                    <img
                                        src={content.image_url}
                                        alt={content.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className={cn("h-32 flex items-center justify-center p-2 text-center text-white font-bold text-xs px-2", bgColor)}>
                                    <span className="line-clamp-4">{content.title}</span>
                                </div>
                            )}

                            {/* Actions & Info */}
                            <div className="p-3 flex flex-col gap-2 bg-[#141414]">
                                <div className="flex items-center gap-2">
                                    <button
                                        className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black hover:bg-gray-200 transition"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/watch/${content.id}`);
                                        }}
                                    >
                                        <Play size={16} fill="black" />
                                    </button>
                                    <button
                                        className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-400 text-white hover:border-white transition"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isInList) {
                                                removeFromMyList(content.id);
                                            } else {
                                                addToMyList(content);
                                            }
                                        }}
                                    >
                                        {isInList ? <Check size={16} /> : <Plus size={16} />}
                                    </button>
                                    <button className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-400 text-white hover:border-white transition">
                                        <ThumbsUp size={16} />
                                    </button>
                                    <div className="flex-1" />
                                    <button
                                        className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-400 text-white hover:border-white transition"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onOpenModal && onOpenModal(content);
                                        }}
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                                    <span className="text-green-500">{matchPercentage} Match</span>
                                    <span className="border border-gray-500 px-1 rounded text-[10px]">{content.rating || "TV-MA"}</span>
                                    <span>
                                        {content.duration}
                                        {/^\d+$/.test(content.duration?.toString() || "") ? " min" : ""}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-1 text-[10px] text-gray-300">
                                    {content.listed_in?.split(',').slice(0, 3).map((genre, i) => (
                                        <span key={i} className="flex items-center">
                                            {genre.trim()}
                                            {i < 2 && <span className="mx-1 text-gray-600">•</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
