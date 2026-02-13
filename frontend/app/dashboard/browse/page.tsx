import { contentApi } from "@/lib/api";
import BrowseClient from "./BrowseClient";

// Since this is a Server Component, we can fetch data directly.
// Note: We are using "force-dynamic" to ensure random content changes on refresh if desired,
// OR we can cache. For "Trending", dynamic is better.
export const dynamic = "force-dynamic";

export default async function BrowsePage() {
    // Fetch data in parallel - simplified approach
    const trendingData = await contentApi.getRandom("", 20).catch(() => []) || [];
    const tvShowsData = await contentApi.filter("", { type: "TV Show" }).catch(() => []) || [];
    const actionData = await contentApi.filter("", { genre: "Action" }).catch(() => []) || [];
    const comedyData = await contentApi.filter("", { genre: "Comedy" }).catch(() => []) || [];
    const documentaryData = await contentApi.filter("", { genre: "Documentary" }).catch(() => []) || [];
    const newReleasesData = await contentApi.getNewReleases("", 10).catch(() => []) || [];

    // Use new releases for hero, fallback to trending
    // Ensure it's a proper array by spreading into a new array
    const heroArray = (newReleasesData && newReleasesData.length > 0)
        ? [...newReleasesData]
        : [...trendingData.slice(0, 5)];

    console.log("[SERVER PAGE] Data summary:", {
        trending: trendingData.length,
        newReleases: newReleasesData.length,
        heroArray: heroArray.length,
        isArray: Array.isArray(heroArray),
        firstHeroTitle: heroArray[0]?.title
    });

    return (
        <BrowseClient
            heroContentArray={JSON.parse(JSON.stringify(heroArray))}
            trendingContent={JSON.parse(JSON.stringify(trendingData))}
            tvShows={JSON.parse(JSON.stringify(tvShowsData))}
            actionContent={JSON.parse(JSON.stringify(actionData))}
            comedyContent={JSON.parse(JSON.stringify(comedyData))}
            topRatedContent={JSON.parse(JSON.stringify(documentaryData))}
            newReleases={JSON.parse(JSON.stringify(newReleasesData))}
        />
    );
}
