"use client";

import { X, Play, Plus, ThumbsUp, Volume2, VolumeX } from "lucide-react";
// import { Dialog, DialogContent } from "@/components/ui/dialog"; // Assuming we have Shadcn UI Dialog
import { Content } from "@/types";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// If you don't have a Dialog component from Shadcn, we can build a simple Modal using fixed positioning.
// Since user asked for "Modal", standard implementation is usually preferred.
// I'll create a standalone Modal to avoid dependency on Shadcn if it's not fully set up or to keep it custom.

interface ContentModalProps {
    content: Content | null;
    onClose: () => void;
}

import { useMyList } from "@/context/MyListContext";
import { Check } from "lucide-react";

export function ContentModal({ content, onClose }: ContentModalProps) {
    const [muted, setMuted] = useState(false);
    const [show, setShow] = useState(false);
    const router = useRouter();
    const { myListIds, addToMyList, removeFromMyList } = useMyList();
    const isInList = content ? myListIds.has(content.id) : false;

    useEffect(() => {
        if (content) setShow(true);
        else setShow(false);
    }, [content]);

    if (!content) return null;

    // Generate color
    const getColor = (str: string) => {
        const colors = [
            "bg-red-900", "bg-blue-900", "bg-green-900", "bg-purple-900",
        ];
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };
    const bgClass = getColor(content.title);

    const handleListToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isInList) {
            removeFromMyList(content.id);
        } else {
            addToMyList(content);
        }
    };

    return (
        <div
            className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/80 transition duration-300",
                show ? "opacity-100 visible" : "opacity-0 invisible"
            )}
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-md bg-[#181818] shadow-2xl scrollbar-hide"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-[#181818] hover:bg-[#181818]/70"
                >
                    <X className="h-6 w-6 text-white" />
                </button>

                {/* Hero Section of Modal */}
                <div
                    className={cn("relative h-96 w-full flex items-end p-10 bg-cover bg-center", bgClass)}
                    style={{ backgroundImage: content.image_url ? `url(${content.image_url})` : undefined }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/20 to-transparent" />

                    <div className="z-10 w-full">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">{content.title}</h2>
                        <div className="flex gap-4">
                            <button
                                onClick={() => router.push(`/watch/${content.id}`)}
                                className="flex items-center gap-2 rounded bg-white px-8 py-2 text-xl font-bold text-black transition hover:bg-[#e6e6e6]"
                            >
                                <Play className="h-7 w-7 fill-black" />
                                Play
                            </button>
                            <button
                                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-400 bg-[#2a2a2a]/60 transition hover:border-white"
                                onClick={handleListToggle}
                            >
                                {isInList ? <Check className="h-6 w-6 text-white" /> : <Plus className="h-6 w-6 text-white" />}
                            </button>
                            <button className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-400 bg-[#2a2a2a]/60 transition hover:border-white">
                                <ThumbsUp className="h-6 w-6 text-white" />
                            </button>
                            <div className="flex-1" />
                            <button
                                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-400 bg-[#2a2a2a]/60 transition hover:border-white"
                                onClick={() => setMuted(!muted)}
                            >
                                {muted ? <VolumeX className="h-6 w-6 text-white" /> : <Volume2 className="h-6 w-6 text-white" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Details */}
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-8 gap-y-4 px-10 py-8">
                    <div className="text-white">
                        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-400">
                            <span className="text-green-500 text-base">98% Match</span>
                            <span>{content.release_year}</span>
                            <span className="border border-gray-500 px-1 rounded text-xs">{content.rating || "TV-MA"}</span>
                            <span>
                                {content.duration}
                                {/^\d+$/.test(content.duration?.toString() || "") ? " min" : ""}
                            </span>
                        </div>
                        <p className="text-lg leading-6">{content.description}</p>
                    </div>

                    <div className="text-sm text-gray-400 flex flex-col gap-4">
                        {content.director && (
                            <div>
                                <span className="text-gray-500">Director: </span>
                                {content.director}
                            </div>
                        )}
                        <div>
                            <span className="text-gray-500">Cast: </span>
                            {content.cast || "N/A"}
                        </div>
                        <div>
                            <span className="text-gray-500">Genres: </span>
                            {content.listed_in}
                        </div>
                        {content.country && (
                            <div>
                                <span className="text-gray-500">Country: </span>
                                {content.country}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
