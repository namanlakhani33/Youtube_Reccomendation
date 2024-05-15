import dayjs from "dayjs";
import { z } from "zod";

// Define the search result schema
const searchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  thumbnail: z.string(),
  description: z.string(),
  channel_id: z.string(),
  channel_url: z.string(),
  duration: z.number().nullable(),
  view_count: z.number(),
  average_rating: z.any(),
  categories: z.array(z.string()).nullable(),
  tags: z.array(z.string()).nullable(),
  comment_count: z.number().nullable(),
  chapters: z.array(
    z.object({
      start_time: z.number(),
      title: z.string(),
      end_time: z.number(),
    })
  ).nullable(),
  like_count: z.number().nullable(),
  channel: z.string(),
  channel_follower_count: z.number().nullable(),
  upload_date: z.string(),
  playlist: z.string(),
  playlist_id: z.string(),
  display_id: z.string(),
  fulltitle: z.string(),
  language: z.string().nullable(),
});

// Define the type for search results
export type SearchResult = z.infer<typeof searchResultSchema>;

// Function to format search results
export const formatSearchResult = (result: SearchResult) => {
  const videoUrl = `https://www.youtube.com/watch?v=${result.id}`;
  return {
    title: result.title,
    channel: result.channel,
    views: result.view_count,
    duration: dayjs()
      .startOf("day")
      .second(result.duration || 0)
      .format("H:mm:ss"),
    videoUrl,
    thumbnail: result.thumbnail,
    chapters: result.chapters?.map((c, idx) => idx + 1 + ". " + c.title) || [],
  };
};

// Function to perform YouTube search
export async function search(query: string, nResults: number = 5): Promise<SearchResult[]> {
  // Construct the search command
  const searchCommand = `yt-dlp "ytsearch${nResults}:${query}" --dump-json`;
  // Perform the search (replace execSync with an appropriate fetch request)
  const rawOutput = await fetch(`/api/youtube-search?query=${encodeURIComponent(query)}&nResults=${nResults}`);
  const results = await rawOutput.json();
  return results.map((line: any) => searchResultSchema.parse(line));
}
