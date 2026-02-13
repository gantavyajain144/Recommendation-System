
"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Content } from "@/types";
import { MovieCard } from "./MovieCard";
import { cn } from "@/lib/utils";

interface ContentRowProps {
    title: string;
    contents: Content[];
    onOpenModal: (content: Content) => void;
}

export function ContentRow({ title, contents, onOpenModal }: ContentRowProps) {
    const rowRef = useRef<HTMLDivElement>(null);
    const [isMoved, setIsMoved] = useState(false);

    const handleClick = (direction: "left" | "right") => {
        setIsMoved(true);
        if (rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current;
            const scrollTo =
                direction === "left"
                    ? scrollLeft - clientWidth
                    : scrollLeft + clientWidth;

            rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    return (
        <div className="h-40 space-y-0.5 md:space-y-2 mb-8">
            <h2 className="cursor-pointer text-sm font-semibold text-[#e5e5e5] transition duration-200 hover:text-white md:text-2xl lg:text-3xl pl-4 md:pl-10">
                {title}
            </h2>

            <div className="group relative md:-ml-2">
                <ChevronLeft
                    className={cn(
                        "absolute top-0 bottom-0 left-2 z-[100] m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100 bg-black/50 rounded-full p-1"
                    )}
                    onClick={() => handleClick("left")}
                />

                <div
                    ref={rowRef}
                    className="flex items-center space-x-0.5 overflow-x-scroll scrollbar-hide md:space-x-2.5 md:p-2 pl-4 md:pl-10 scroll-smooth"
                >
                    {contents.map((content) => (
                        <MovieCard key={content.id} content={content} onOpenModal={onOpenModal} />
                    ))}
                </div>

                <ChevronRight
                    className="absolute top-0 bottom-0 right-2 z-[100] m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100 bg-black/50 rounded-full p-1"
                    onClick={() => handleClick("right")}
                />
            </div>
        </div>
    );
}
