import { execSync } from "child_process";
import dotenv from "dotenv";
import dayjs from "dayjs";
import { z } from "zod";
import { writeFileSync } from "fs";

dotenv.config();

const searchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  thumbnail: z.string(),
  description: z.string(),
  channel_id: z.string(),
  channel_url: z.string(),
  duration: z.number().nullish(),
  view_count: z.number(),
  average_rating: z.any(),
  categories: z.array(z.string()).nullish(),
  tags: z.string().array().nullish(),
  comment_count: z.number().nullish(),
  chapters: z
    .array(
      z.object({
        start_time: z.number(),
        title: z.string(),
        end_time: z.number(),
      })
    )
    .nullish(),
  like_count: z.number().nullish(),
  channel: z.string(),
  channel_follower_count: z.number().nullish(),
  upload_date: z.string(),
  playlist: z.string(),
  playlist_id: z.string(),
  display_id: z.string(),
  fulltitle: z.string(),
  language: z.string().nullish(),
});

export type SearchResult = z.infer<typeof searchResultSchema>;

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
    thumbnail: result.thumbnail, // Include thumbnail URL
    chapters: result.chapters?.map((c, idx) => idx + 1 + ". " + c.title) || [],
  };
};

interface YouTubeSearchArgs {
  query: string;
  randomlyAppendTerms?: string[];
  n_results?: number;
}

const pickRandom = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export async function search(args: YouTubeSearchArgs): Promise<SearchResult[]> {
  const searchCommand = `yt-dlp "ytsearch${args.n_results || 5}:${
    args.query +
    (args.randomlyAppendTerms ? " " + pickRandom(args.randomlyAppendTerms) : "")
  }" --dump-json`;
  const rawOutput = execSync(searchCommand, {
    maxBuffer: 10 * 1024 * 1024, // 10 MB
  })
    .toString()
    .trim()
    .split("\n");
  const results = rawOutput.map((line) =>
    searchResultSchema.parse(JSON.parse(line))
  );
  return results || [];
}

if (require.main === module) {
  (async () => {
    const query = process.argv[2];
    const n_results = Number.parseInt(process.argv[5]) || 5;
    if (!query) {
      console.error("Please provide a query");
      process.exit(1);
    }
    const results = await search({ query, n_results });

    // Map results using formatSearchResult function
    const formattedResults = results.map(formatSearchResult);

    // Write formatted results to JSON file
    // writeFileSync("searchResults.json", JSON.stringify(formattedResults, null, 2));
    writeFileSync("./src/searchResults.json", JSON.stringify(formattedResults, null, 2));

    // Display formatted results in the console
    console.log(formattedResults.map(result => `
Title: ${result.title}
Channel: ${result.channel}
Views: ${result.views}
Duration: ${result.duration}
Video URL: ${result.videoUrl}
Thumbnail: ${result.thumbnail}  // Display thumbnail URL
Chapters:
${result.chapters.join("\n")}
`).join("\n---\n"));
  })();
}
