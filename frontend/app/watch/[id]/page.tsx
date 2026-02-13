//  video play

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { contentApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Content } from "@/types";

export default function WatchPage() {
    const { id } = useParams();
    const router = useRouter();
    const { token } = useAuth();
    const [content, setContent] = useState<Content | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            if (!id || !token) return;
            try {
                const data = await contentApi.getById(token, Number(id));
                setContent(data);
            } catch (error) {
                console.error("Failed to load content", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [id, token]);

    if (loading) {
        return <div className="h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    }

    if (!content) {
        return <div className="h-screen bg-black text-white flex items-center justify-center">Content not found</div>;
    }

    return (
        <div className="h-screen w-screen bg-black relative">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="absolute top-4 left-4 z-50 text-white bg-black/50 p-2 rounded-full hover:bg-white/20"
            >
                <ArrowLeft size={32} />
            </button>

            {/* Video Player */}
            <div className="w-full h-full flex items-center justify-center">
                {content.video_url ? (
                    (content.video_url.includes("youtube.com") || content.video_url.includes("youtu.be")) ? (
                        <iframe
                            className="w-full h-full"
                            src={(() => {
                                let videoId = "";
                                if (content.video_url.includes("youtu.be")) {
                                    videoId = content.video_url.split("youtu.be/")[1]?.split("?")[0];
                                } else if (content.video_url.includes("v=")) {
                                    videoId = content.video_url.split("v=")[1]?.split("&")[0];
                                }
                                return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`;
                            })()}
                            title={content.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <video
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                            src={content.video_url}
                        >
                            Your browser does not support the video tag.
                        </video>
                    )
                ) : (
                    <div className="text-white text-xl">
                        No video available for this title.
                        <br />
                        <span className="text-sm text-gray-500">(Edit this content in Admin Dashboard to add a video URL)</span>
                    </div>
                )}
            </div>
        </div>
    );
}
