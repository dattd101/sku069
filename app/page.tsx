import { getBannerAds } from "@/lib/banner-ads";
import MovieBrowser from "@/components/MovieBrowser";
import { getMovieSummaries } from "@/lib/movies";

export const dynamic = "force-static";

export default async function Home() {
  const movies = await getMovieSummaries();
  const ads = getBannerAds();

  return (
    <main>
      <header className="hero">
        <div className="container heroInner">
          <div>
            <div className="eyebrow">SOCIAL MOVIE COLLECTION</div>
            <h1>Danh sách phim</h1>
            <p>
              Khám phá phim mới nhất từ Facebook, YouTube và TikTok.
            </p>
          </div>
          <div className="heroStats" aria-label={`${movies.length} bộ phim`}>
            <div><strong>{movies.length}</strong><span>bộ phim</span></div>
          </div>
        </div>
      </header>

      <div className="container content">
        <MovieBrowser movies={movies} ads={ads} />
      </div>

      <footer className="footer">
        <div className="container">Các bạn đang xem phim tại nguồn sưu tầm.</div>
      </footer>
    </main>
  );
}
