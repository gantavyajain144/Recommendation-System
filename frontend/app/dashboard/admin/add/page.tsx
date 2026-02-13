"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { contentApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function AddContentPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [imageError, setImageError] = useState(false);
    const [videoSource, setVideoSource] = useState<"url" | "upload">("url");

    const ratings = ["TV-MA", "TV-14", "TV-PG", "R", "PG-13", "PG", "G"];

    const formik = useFormik({
        initialValues: {
            title: "",
            description: "",
            type: "Movie",
            release_year: new Date().getFullYear(),
            rating: "TV-MA",
            duration: "",
            listed_in: "",
            image_url: "",
            video_url: "",
            director: "",
            cast: "",
            country: "",
            show_id: `s${Date.now()}`,
        },
        validationSchema: Yup.object({
            title: Yup.string().required("Title is required"),
            description: Yup.string().required("Description is required"),
            type: Yup.string().oneOf(["Movie", "TV Show"]).required("Type is required"),
            release_year: Yup.number().required("Year is required").min(1900, "Invalid year").max(new Date().getFullYear() + 5, "Invalid year"),
            rating: Yup.string().required("Rating is required"),
            duration: Yup.string().required("Duration is required"),
            listed_in: Yup.string().required("Genres are required"),
            image_url: Yup.string().url("Must be a valid URL").required("Image URL is required"),
            video_url: Yup.string().url("Must be a valid URL").nullable(),
            director: Yup.string(),
            cast: Yup.string(),
            country: Yup.string(),
        }),
        onSubmit: async (values) => {
            if (!token) {
                setError("You must be logged in to add content.");
                return;
            }
            setLoading(true);
            setError("");
            try {
                let finalDuration = values.duration;
                if (values.type === "TV Show" && !finalDuration.toLowerCase().includes("season")) {
                    finalDuration = `${finalDuration} Season${finalDuration !== "1" ? "s" : ""}`;
                } else if (values.type === "Movie" && !finalDuration.toLowerCase().includes("min")) {
                    finalDuration = `${finalDuration} min`;
                }

                await contentApi.create(token, { ...values, duration: finalDuration });
                router.push("/dashboard");
            } catch (err: any) {
                console.error("Add Content Error:", err);
                setError(err.message || "Failed to add content. Please try again.");
            } finally {
                setLoading(false);
            }
        },
    });

    const inputStyle = { backgroundColor: "#333", color: "white", borderColor: "#4b5563" };

    return (
        <div className="min-h-screen bg-[#141414] text-white p-8 pt-24 flex justify-center">
            <div className="w-full max-w-4xl bg-black/50 p-8 rounded-lg border border-gray-800">
                <h1 className="text-3xl font-bold mb-8">Add New Content</h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                            <Input
                                id="title"
                                name="title"
                                type="text"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.title}
                                className="placeholder-gray-400 focus:ring-red-600"
                                style={inputStyle}
                                placeholder="e.g. Inception"
                            />
                            {formik.touched.title && formik.errors.title ? (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.title}</div>
                            ) : null}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                            <select
                                id="type"
                                name="type"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.type}
                                className="w-full h-10 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                                style={inputStyle}
                            >
                                <option value="Movie">Movie</option>
                                <option value="TV Show">TV Show</option>
                            </select>
                        </div>
                    </div>

                    {/* Image URL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Image URL (Thumbnail)</label>
                            <Input
                                id="image_url"
                                name="image_url"
                                type="url"
                                onChange={(e) => {
                                    formik.handleChange(e);
                                    setImageError(false); // Reset error on change
                                }}
                                onBlur={formik.handleBlur}
                                value={formik.values.image_url}
                                className="placeholder-gray-400 focus:ring-red-600"
                                style={inputStyle}
                                placeholder="https://example.com/poster.jpg"
                            />
                            {formik.touched.image_url && formik.errors.image_url ? (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.image_url}</div>
                            ) : null}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Video Source</label>
                            <select
                                value={videoSource}
                                onChange={(e) => setVideoSource(e.target.value as "url" | "upload")}
                                className="w-full h-10 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 mb-3 px-3"
                                style={inputStyle}
                            >
                                <option value="url">External URL</option>
                                <option value="upload">Upload File</option>
                            </select>

                            {videoSource === "url" ? (
                                <>
                                    <Input
                                        id="video_url"
                                        name="video_url"
                                        type="url"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.video_url}
                                        className="placeholder-gray-400 focus:ring-red-600 w-full"
                                        style={inputStyle}
                                        placeholder="https://example.com/movie.mp4"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Paste a direct link to an MP4 or YouTube video.</p>
                                </>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        id="video-upload"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file && token) {
                                                try {
                                                    setLoading(true);
                                                    const res = await contentApi.uploadVideo(token, file);
                                                    formik.setFieldValue("video_url", res.url);
                                                } catch (err) {
                                                    console.error("Upload failed", err);
                                                    setError("Video upload failed");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="video-upload"
                                        className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md h-10 flex items-center justify-center w-full text-sm transition-colors border border-gray-600"
                                    >
                                        {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                        {formik.values.video_url ? "Video Uploaded (Click to Change)" : "Select Video File"}
                                    </label>
                                    {formik.values.video_url && (
                                        <p className="text-xs text-green-500 mt-1 truncate">
                                            Uploaded: {formik.values.video_url}
                                        </p>
                                    )}
                                </div>
                            )}

                            {formik.touched.video_url && formik.errors.video_url ? (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.video_url}</div>
                            ) : null}
                        </div>
                    </div>

                    {/* Preview */}
                    {formik.values.image_url && !formik.errors.image_url && (
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Preview</label>
                            {imageError ? (
                                <div className="h-40 w-full rounded border border-gray-700 bg-gray-800 flex items-center justify-center text-gray-500 text-sm">
                                    Unable to load image preview
                                </div>
                            ) : (
                                <img
                                    src={formik.values.image_url}
                                    alt="Preview"
                                    className="h-64 rounded object-contain border border-gray-700 bg-black"
                                    onError={() => setImageError(true)}
                                />
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.description}
                            rows={4}
                            className="w-full rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 p-3"
                            style={inputStyle}
                            placeholder="Movie plot summary..."
                        />
                        {formik.touched.description && formik.errors.description ? (
                            <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
                        ) : null}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Year</label>
                            <Input
                                id="release_year"
                                name="release_year"
                                type="number"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.release_year}
                                className="placeholder-gray-400 focus:ring-red-600"
                                style={inputStyle}
                            />
                            {formik.touched.release_year && formik.errors.release_year ? (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.release_year}</div>
                            ) : null}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Rating</label>
                            <select
                                id="rating"
                                name="rating"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.rating}
                                className="w-full h-10 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 px-3"
                                style={inputStyle}
                            >
                                {ratings.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                {formik.values.type === "TV Show" ? "No. of Seasons" : "Duration (min)"}
                            </label>
                            <Input
                                id="duration"
                                name="duration"
                                type="text"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.duration}
                                className="placeholder-gray-400 focus:ring-red-600"
                                style={inputStyle}
                                placeholder={formik.values.type === "TV Show" ? "e.g. 2" : "e.g. 120"}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Genres</label>
                            <Input
                                id="listed_in"
                                name="listed_in"
                                type="text"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.listed_in}
                                className="placeholder-gray-400 focus:ring-red-600"
                                style={inputStyle}
                                placeholder="Action, Drama"
                            />
                            {formik.touched.listed_in && formik.errors.listed_in ? (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.listed_in}</div>
                            ) : null}
                        </div>
                    </div>

                    {/* Extra Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Director</label>
                            <Input
                                id="director"
                                name="director"
                                type="text"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.director}
                                className="placeholder-gray-400 focus:ring-red-600"
                                style={inputStyle}
                                placeholder="Christopher Nolan"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Country</label>
                            <Input
                                id="country"
                                name="country"
                                type="text"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.country}
                                className="placeholder-gray-400 focus:ring-red-600"
                                style={inputStyle}
                                placeholder="United States"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Cast</label>
                            <Input
                                id="cast"
                                name="cast"
                                type="text"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.cast}
                                className="placeholder-gray-400 focus:ring-red-600"
                                style={inputStyle}
                                placeholder="Leonardo DiCaprio, Joseph Gordon-Levitt..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin h-5 w-5" />}
                            {loading ? "Adding..." : "Add Content"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
