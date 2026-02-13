import { contentApi } from "@/lib/api";
import BrowseClient from "./browse/BrowseClient";

// Server Component (Same as BrowsePage)
// Fetches data efficiently on the server
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    // Fetch data in parallel
    const [
        heroData,
        trendingData,
        tvShowsData,
        actionData,
        comedyData,
        documentaryData,
        newReleases
    ] = await Promise.all([
        contentApi.getRandom("", 1), // Single random for Hero
        contentApi.getRandom("", 20), // Trending
        contentApi.filter("", { type: "TV Show" }),
        contentApi.filter("", { genre: "Action" }),
        contentApi.filter("", { genre: "Comedy" }),
        contentApi.filter("", { genre: "Documentary" }),
        contentApi.getNewReleases("", 10), // Fetch New Releases
    ]);

    const heroContent = heroData[0] || trendingData[0];

    return (
        <BrowseClient
            heroContentArray={heroContent ? [heroContent] : []}
            trendingContent={trendingData}
            tvShows={tvShowsData}
            actionContent={actionData}
            comedyContent={comedyData}
            topRatedContent={documentaryData}
            newReleases={newReleases}
        />
    );
}
