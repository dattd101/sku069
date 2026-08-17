import path from "node:path";

// SheetJS khuyến nghị dùng CommonJS trong Node.js.
// next.config.ts externalize package này để Next/Turbopack dùng native Node require.
const XLSX: typeof import("xlsx") = require("xlsx");

export type Movie = {
  id: string;
  slug: string;
  title: string;
  image: string;
  description: string;
  category: string;
};

export type Episode = {
  id: string;
  movieId: string;
  episode: number;
  title: string;
  url: string;
  platform: "youtube" | "facebook" | "tiktok" | string;
};

export type MovieSummary = Movie & {
  episodeCount: number;
  platforms: string[];
};

type ExcelRow = Record<string, unknown>;

function asText(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function normalizeRow(row: ExcelRow): ExcelRow {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.trim().toLowerCase(), value]),
  );
}

function readRows(workbook: import("xlsx").WorkBook, sheetName: string): ExcelRow[] {
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) return [];

  return XLSX.utils
    .sheet_to_json<ExcelRow>(worksheet, {
      defval: "",
      raw: false,
    })
    .map(normalizeRow);
}

function readWorkbook(): import("xlsx").WorkBook {
  const filePath = path.join(process.cwd(), "data", "movies.xlsx");

  // Đọc trực tiếp ở server/build time. Không chạy ở browser.
  return XLSX.readFile(filePath, {
    cellDates: false,
  });
}

function parseMovies(rows: ExcelRow[]): Movie[] {
  return rows.flatMap((row) => {
    const id = asText(row.id);
    const title = asText(row.title);
    const slug = asText(row.slug);

    if (!id || !title || !slug) return [];

    return [
      {
        id,
        slug,
        title,
        image: asText(row.image) || "/uploads/placeholder.webp",
        description: asText(row.description),
        category: asText(row.category),
      },
    ];
  });
}

function parseEpisodes(rows: ExcelRow[]): Episode[] {
  const episodes = rows.flatMap((row, index) => {
    const id = asText(row.id);
    const movieId = asText(row.movie_id);
    const url = asText(row.url);

    if (!id || !movieId || !url) return [];

    const episodeNumber = Number(asText(row.episode));

    return [
      {
        id,
        movieId,
        episode: Number.isFinite(episodeNumber) && episodeNumber > 0 ? episodeNumber : index + 1,
        title: asText(row.title) || `Tập ${index + 1}`,
        url,
        platform: asText(row.platform).toLowerCase(),
      },
    ];
  });

  return episodes.sort((a, b) => {
    if (a.movieId !== b.movieId) return a.movieId.localeCompare(b.movieId);
    return a.episode - b.episode;
  });
}

export async function getCatalog() {
  const workbook = readWorkbook();
  const movies = parseMovies(readRows(workbook, "movies"));
  const episodes = parseEpisodes(readRows(workbook, "episodes"));

  return { movies, episodes };
}

export async function getMovieSummaries(): Promise<MovieSummary[]> {
  const { movies, episodes } = await getCatalog();

  return movies.map((movie) => {
    const movieEpisodes = episodes.filter((episode) => episode.movieId === movie.id);
    const platforms = Array.from(
      new Set(movieEpisodes.map((episode) => episode.platform).filter(Boolean)),
    );

    return {
      ...movie,
      episodeCount: movieEpisodes.length,
      platforms,
    };
  });
}

export async function getMovieBySlug(slug: string) {
  const { movies, episodes } = await getCatalog();
  const movie = movies.find((item) => item.slug === slug);
  if (!movie) return null;

  return {
    movie,
    episodes: episodes.filter((episode) => episode.movieId === movie.id),
  };
}
