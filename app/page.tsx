import MovieBrowser from "@/components/MovieBrowser";
import { getMovieSummaries } from "@/lib/movies";

export const dynamic = "force-static";

export default async function Home() {
  const movies = await getMovieSummaries();
  const totalEpisodes = movies.reduce((sum, movie) => sum + movie.episodeCount, 0);

  return (
    <main>
      <header className="hero">
        <div className="container heroInner">
          <div>
            <div className="eyebrow">SOCIAL MOVIE COLLECTION</div>
            <h1>Danh sách phim &amp; tập phim</h1>
            <p>
              Các tập phim liên kết bằng link xem có thể đến Facebook, YouTube hoặc TikTok.
            </p>
          </div>
          <div className="heroStats" aria-label={`${movies.length} phim, ${totalEpisodes} tập`}>
            <div><strong>{movies.length}</strong><span>bộ phim</span></div>
            <div><strong>{totalEpisodes}</strong><span>tập phim</span></div>
          </div>
        </div>
      </header>

      <div className="container content">
        <MovieBrowser movies={movies} />
      </div>

      <footer className="footer">
        <div className="container">Các bạn đang xem phim tại nguồn sưu tầm.</div>
      </footer>
    </main>
  );
}
