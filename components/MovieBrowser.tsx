"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { MovieSummary } from "@/lib/movies";

type Platform = "all" | "youtube" | "facebook" | "tiktok";

const ITEMS_PER_PAGE = 30;

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

export default function MovieBrowser({ movies }: { movies: MovieSummary[] }) {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<Platform>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return movies.filter((movie) => {
      const matchesPlatform = platform === "all" || movie.platforms.includes(platform);
      const matchesQuery =
        !keyword ||
        movie.title.toLowerCase().includes(keyword) ||
        movie.description.toLowerCase().includes(keyword) ||
        movie.category.toLowerCase().includes(keyword);

      return matchesPlatform && matchesQuery;
    });
  }, [movies, platform, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMovies = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const pageItems = getPageItems(safeCurrentPage, totalPages);

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

        <div className="filters" role="group" aria-label="Nền tảng có tập phim">
          {platforms.map((item) => (
            <button
              key={item.value}
              type="button"
              className={platform === item.value ? "filter active" : "filter"}
              onClick={() => {
                setPlatform(item.value);
                setCurrentPage(1);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <div className="resultMeta" id="movie-results">
        <span>{filtered.length} bộ phim</span>
        {filtered.length > 0 && totalPages > 1 && (
          <span>Trang {safeCurrentPage}/{totalPages}</span>
        )}
      </div>

      {filtered.length > 0 ? (
        <>
          <section className="movieGrid">
            {paginatedMovies.map((movie) => (
              <article className="movieCard" key={movie.id}>
                <Link className="posterLink" href={`/phim/${movie.slug}`}>
                  <div className="poster">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={movie.image} alt={movie.title} loading="lazy" />
                    <span className="episodeBadge">{movie.episodeCount} tập</span>
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
                    Xem danh sách tập <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </section>

          {totalPages > 1 && (
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
