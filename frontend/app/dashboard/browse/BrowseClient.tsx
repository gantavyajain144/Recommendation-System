"use client";

import { useState, useEffect } from "react";
import { Content } from "@/types";
import { HeroSection } from "@/components/netflix/HeroSection";
import { ContentRow } from "@/components/netflix/ContentRow";
import { ContentModal } from "@/components/netflix/ContentModal";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { contentApi } from "@/lib/api";
import { MovieCard } from "@/components/netflix/MovieCard";
import { useSidebar } from "@/context/SidebarContext";
import { useMyList } from "@/context/MyListContext";
import { cn } from "@/lib/utils";

interface BrowseClientProps {
    heroContentArray: Content[];
    trendingContent: Content[];
    topRatedContent: Content[];
    actionContent: Content[];
    comedyContent: Content[];
    tvShows: Content[];
    newReleases: Content[];
}

export default function BrowseClient({
    heroContentArray,
    trendingContent,
    topRatedContent,
    actionContent,
    comedyContent,
    tvShows,
    newReleases,
}: BrowseClientProps) {
    console.log("BrowseClient Refs:", { newReleasesLength: newReleases?.length, trendingLength: trendingContent?.length });
    const [modalContent, setModalContent] = useState<Content | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Content[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [category, setCategory] = useState<"home" | "Series" | "Movies" | "mylist">("home");
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const [clientHeroArray, setClientHeroArray] = useState<Content[]>([]);
    const { myList } = useMyList();

    // Fetch new releases for hero section on client side
    useEffect(() => {
        const fetchHeroContent = async () => {
            try {
                const newReleases = await contentApi.getNewReleases("", 10);
                // Filter to only include content with image URLs for hero section
                const contentWithImages = newReleases?.filter(item => item.image_url) || [];

                if (contentWithImages.length > 0) {
                    setClientHeroArray(contentWithImages);
                } else {
                    setClientHeroArray(trendingContent.slice(0, 5));
                }
            } catch (error) {
                console.error("Failed to fetch hero content:", error);
                setClientHeroArray(trendingContent.slice(0, 5));
            }
        };

        fetchHeroContent();
    }, [trendingContent]);

    // Auto-rotate hero content every 5 seconds
    useEffect(() => {
        if (!clientHeroArray || clientHeroArray.length === 0) {
            console.warn("Hero rotation disabled - no content array");
            return;
        }

        const interval = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % clientHeroArray.length);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [clientHeroArray]);

    // Get hero content with multiple fallbacks
    const heroContent = clientHeroArray?.[currentHeroIndex]
        || clientHeroArray?.[0]
        || trendingContent?.[0]
        || null;

    console.log("Hero Debug:", {
        clientHeroArrayLength: clientHeroArray?.length,
        currentHeroIndex,
        heroContentTitle: heroContent?.title,
        hasHeroContent: !!heroContent,
        trendingLength: trendingContent?.length
    });

    // Filter content based on selected category
    const filteredTrending = category === "home" ? trendingContent :
        category === "Series" ? trendingContent.filter(c => c.type === "TV Show") :
            trendingContent.filter(c => c.type === "Movie");

    const filteredNewReleases = category === "home" ? newReleases :
        category === "Series" ? newReleases?.filter(c => c.type === "TV Show") :
            newReleases?.filter(c => c.type === "Movie");

    // For other rows, we selectively show them based on category
    const showTvShows = category === "home" || category === "Series";
    const showMovies = category === "home" || category === "Movies";

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setIsSearching(true);
                try {
                    const results = await contentApi.search("", searchQuery);
                    setSearchResults(results);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const openModal = (content: Content) => {
        setModalContent(content);
    };

    const closeModal = () => {
        setModalContent(null);
    };

    const { isSidebarOpen } = useSidebar();

    return (
        <div className="relative min-h-screen bg-[#141414] text-white">
            {/* Navbar / Search Bar */}
            {/* Navbar / Search Bar */}
            <div className={cn(
                "fixed top-0 right-0 z-50 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/50 to-transparent px-4 py-4 md:px-10 transition-all duration-300",
                isSidebarOpen ? "left-0 md:left-72" : "left-0 pl-16 md:pl-20"
            )}>
                <div className="flex items-center gap-8">
                    <h1
                        className="text-2xl font-bold text-red-600 cursor-pointer"
                        onClick={() => setCategory("home")}
                    >
                        NETFLIX
                    </h1 >
                    <span
                        className={`cursor-pointer hover:text-white ${category === "home" ? "font-bold text-white" : ""}`}
                        onClick={() => setCategory("home")}
                    >
                        Home
                    </span>
                    <span
                        className={`cursor-pointer hover:text-white ${category === "Series" ? "font-bold text-white" : ""}`}
                        onClick={() => setCategory("Series")}
                    >
                        Series
                    </span>
                    <span
                        className={`cursor-pointer hover:text-white ${category === "Movies" ? "font-bold text-white" : ""}`}
                        onClick={() => setCategory("Movies")}
                    >
                        Movies
                    </span>
                    {/* <span className="cursor-pointer hover:text-white">New & Popular</span> */}
                    <span
                        className={`cursor-pointer hover:text-white ${category === "mylist" ? "font-bold text-white" : ""}`}
                        onClick={() => setCategory("mylist")}
                    >
                        My List
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex items-center bg-black/60 border border-white/30 rounded px-2 py-1 transition-all focus-within:border-white focus-within:bg-black/90">
                        <Search className="h-5 w-5 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Titles, genres"
                            className="bg-transparent border-none focus:outline-none text-white text-sm ml-2 w-24 md:w-64 placeholder-gray-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <X
                                className="h-4 w-4 text-gray-400 cursor-pointer hover:text-white ml-1"
                                onClick={() => setSearchQuery("")}
                            />
                        )}
                    </div>
                </div>
            </div >

            {
                searchQuery.length > 2 ? (
                    <div className="pt-24 px-4 md:px-10 min-h-screen">
                        <h2 className="text-xl text-gray-400 mb-4">
                            Results for "{searchQuery}"
                        </h2>
                        {isSearching ? (
                            <div className="text-white">Searching...</div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {searchResults.map((content) => (
                                    <div key={content.id} className="relative w-full aspect-video">
                                        <MovieCard
                                            content={content}
                                            onOpenModal={openModal}
                                            className="!min-w-0 !w-full !h-full"
                                        />
                                    </div>
                                ))}
                                {searchResults.length === 0 && (
                                    <div className="text-gray-500 col-span-full text-center py-20">
                                        No matches found for "{searchQuery}".
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {category === "mylist" ? (
                            <div className="pt-24 px-4 md:px-10 min-h-screen">
                                <h2 className="text-2xl font-bold text-white mb-6">My List</h2>
                                {myList.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {myList.map((content) => (
                                            <div key={content.id} className="relative w-full aspect-video">
                                                <MovieCard
                                                    content={content}
                                                    onOpenModal={openModal}
                                                    className="!min-w-0 !w-full !h-full"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-center py-20">
                                        Your list is empty. Add shows and movies to watch them later.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <HeroSection content={heroContent} onOpenModal={openModal} />

                                <section className="flex flex-col gap-8 md:gap-12 mt-[-20px] relative z-10 pl-4 md:pl-10 pb-20">
                                    {/* New on Netflix - Top Priority */}
                                    {filteredNewReleases && filteredNewReleases.length > 0 && (
                                        <ContentRow title="New on Netflix" contents={filteredNewReleases} onOpenModal={openModal} />
                                    )}

                                    {/* Always show Trending (filtered by category if necessary) */}
                                    {filteredTrending.length > 0 && (
                                        <ContentRow title={category === "Series" ? "Trending TV Shows" : category === "Movies" ? "Trending Movies" : "Trending Now"} contents={filteredTrending} onOpenModal={openModal} />
                                    )}

                                    {/* TV Shows Row - Only on Home or Series */}
                                    {showTvShows && tvShows.length > 0 && (
                                        <ContentRow title="TV Shows" contents={tvShows} onOpenModal={openModal} />
                                    )}

                                    {/* Action Movies - Only on Home or Films */}
                                    {showMovies && actionContent.length > 0 && (
                                        <ContentRow title="Action Movies" contents={actionContent} onOpenModal={openModal} />
                                    )}

                                    {/* Comedy Movies - Only on Home or Films */}
                                    {showMovies && comedyContent.length > 0 && (
                                        <ContentRow title="Comedy Movies" contents={comedyContent} onOpenModal={openModal} />
                                    )}

                                    {/* Top Rated - Show Generic or specific */}
                                    {topRatedContent.length > 0 && (
                                        <ContentRow title="Top Rated & Critically Acclaimed" contents={topRatedContent} onOpenModal={openModal} />
                                    )}
                                </section>
                            </>
                        )}
                    </>
                )
            }

            < ContentModal content={modalContent} onClose={closeModal} />
        </div >
    );
}
