"use client";

import Link from "next/link";
import BannerCard from "@/components/BannerCard";
import type { BannerAd } from "@/lib/banner-ads";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { MovieSummary } from "@/lib/movies";

type Platform = "all" | "youtube" | "facebook" | "tiktok";

const ITEMS_PER_PAGE = 15;
const CLICK_STORAGE_KEY = "movie-links:clicks";

function readClicks(): Record<string, number> | null {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(CLICK_STORAGE_KEY) || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
    return Object.fromEntries(Object.entries(saved).filter(([, count]) =>
      typeof count === "number" && Number.isSafeInteger(count) && count >= 0,
    ));
  } catch {
    return null;
  }
}

const platforms: { value: Platform; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "youtube", label: "YouTube" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
];

function platformLabel(platform: string) {
  if (platform === "youtube") return "YouTube";
  if (platform === "facebook") return "Facebook";
  if (platform === "tiktok") return "TikTok";
  return platform || "Khác";
}

function getPageItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

export default function MovieBrowser({ movies, ads = [] }: { movies: MovieSummary[]; ads?: BannerAd[] }) {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<Platform>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [popular, setPopular] = useState(false);
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const countsRef = useRef<Record<string, number>>({});

  function refreshClicks() {
    const saved = readClicks();
    if (saved) {
      countsRef.current = saved;
      setClickCounts(saved);
    }
  }

  useEffect(() => {
    refreshClicks();
    const syncClicks = (event: StorageEvent) => {
      if (event.key === CLICK_STORAGE_KEY || event.key === null) refreshClicks();
    };
    window.addEventListener("storage", syncClicks);
    return () => window.removeEventListener("storage", syncClicks);
  }, []);

  function recordClick(movieId: string) {
    const current = readClicks() ?? countsRef.current;
    const count = Math.max(
      Object.hasOwn(current, movieId) ? current[movieId] : 0,
      Object.hasOwn(countsRef.current, movieId) ? countsRef.current[movieId] : 0,
    );
    const next = { ...current, [movieId]: Math.min(count + 1, Number.MAX_SAFE_INTEGER) };
    countsRef.current = next;
    setClickCounts(next);
    try {
      localStorage.setItem(CLICK_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Vẫn đếm trong trang hiện tại nếu trình duyệt không cho phép lưu.
    }
  }

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    const matches = movies.filter((movie) => {
      const matchesPlatform = platform === "all" || movie.platforms.includes(platform);
      const matchesQuery =
        !keyword ||
        movie.title.toLowerCase().includes(keyword) ||
        movie.description.toLowerCase().includes(keyword) ||
        movie.category.toLowerCase().includes(keyword);

      return matchesPlatform && matchesQuery;
    });
    return popular
      ? matches.sort((a, b) => (clickCounts[b.id] || 0) - (clickCounts[a.id] || 0))
      : matches;
  }, [movies, platform, query, popular, clickCounts]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMovies = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const pageItems = getPageItems(safeCurrentPage, totalPages);
  const banner1 = ads.find((ad) => ad.page === safeCurrentPage && ad.slot === 1);
  const banner2 = ads.find((ad) => ad.page === safeCurrentPage && ad.slot === 2);
  const banner1Index = Math.min(3, paginatedMovies.length - 1);
  const banner2Index = Math.min(banner1 ? 12 : 13, paginatedMovies.length - 1);

  const goToPage = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(nextPage);

    requestAnimationFrame(() => {
      document.getElementById("movie-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <>
      <section className="toolbar" aria-label="Bộ lọc phim">
        <label className="searchBox">
          <span className="srOnly">Tìm phim</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
          </svg>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tiêu đề, mô tả, thể loại..."
          />
        </label>

        <div className="filters" role="group" aria-label="Nền tảng xem phim">
          {platforms.map((item) => (
            <button
              key={item.value}
              type="button"
              className={!popular && platform === item.value ? "filter active" : "filter"}
              aria-pressed={!popular && platform === item.value}
              onClick={() => {
                setPlatform(item.value);
                setPopular(false);
                setCurrentPage(1);
              }}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            className={popular ? "filter active" : "filter"}
            aria-pressed={popular}
            onClick={() => {
              setPopular(true);
              setPlatform("all");
              setCurrentPage(1);
              void refreshClicks();
            }}
          >
            Được xem nhiều
          </button>
        </div>
      </section>

      <div className="resultMeta" id="movie-results">
        <span>{filtered.length} bộ phim</span>
        {filtered.length > 0 && (
          <span>Trang {safeCurrentPage}/{totalPages}</span>
        )}
      </div>

      {filtered.length > 0 ? (
        <>
          <section className="movieGrid">
            {paginatedMovies.map((movie, index) => (
              <Fragment key={movie.id}>
              <article
                className="movieCard"
                onClick={() => void recordClick(movie.id)}
                onAuxClick={(event) => {
                  if (event.button === 1) void recordClick(movie.id);
                }}
              >
                <Link className="posterLink" href={`/phim/${movie.slug}`}>
                  <div className="poster">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={movie.image} alt={movie.title} loading="lazy" />
                    <span className="playButton" aria-hidden="true">▶</span>
                  </div>
                </Link>

                <div className="cardBody">
                  {movie.category && <div className="category">{movie.category}</div>}
                  <h2><Link href={`/phim/${movie.slug}`}>{movie.title}</Link></h2>
                  {movie.description && <p>{movie.description}</p>}

                  <div className="platformList" aria-label="Nền tảng">
                    {movie.platforms.map((item) => (
                      <span className={`platformBadge inline ${item}`} key={item}>
                        {platformLabel(item)}
                      </span>
                    ))}
                  </div>

                  <Link className="watchButton" href={`/phim/${movie.slug}`}>
                    Xem phim <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
              {index === banner1Index && banner1 && <BannerCard ad={banner1} />}
              {index === banner2Index && banner2 && <BannerCard ad={banner2} wide />}
              </Fragment>
            ))}
          </section>

          {filtered.length > 0 && (
            <nav className="pagination" aria-label="Phân trang danh sách phim">
              <button
                type="button"
                className="pageButton pageNav"
                onClick={() => goToPage(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
              >
                ← Trước
              </button>

              <div className="pageNumbers">
                {pageItems.map((item, index) =>
                  item === "ellipsis" ? (
                    <span className="pageEllipsis" key={`ellipsis-${index}`} aria-hidden="true">…</span>
                  ) : (
                    <button
                      type="button"
                      className={item === safeCurrentPage ? "pageButton active" : "pageButton"}
                      onClick={() => goToPage(item)}
                      aria-label={`Trang ${item}`}
                      aria-current={item === safeCurrentPage ? "page" : undefined}
                      key={item}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                className="pageButton pageNav"
                onClick={() => goToPage(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
              >
                Sau →
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className="emptyState">
          <strong>Không tìm thấy phim phù hợp.</strong>
          <span>Thử đổi từ khóa hoặc chọn “Tất cả”.</span>
        </div>
      )}
    </>
  );
}
