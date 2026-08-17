import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalog, getMovieBySlug } from "@/lib/movies";

export const dynamic = "force-static";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function platformLabel(platform: string) {
  if (platform === "youtube") return "YouTube";
  if (platform === "facebook") return "Facebook";
  if (platform === "tiktok") return "TikTok";
  return platform || "Khác";
}

export async function generateStaticParams() {
  const { movies } = await getCatalog();
  return movies.map((movie) => ({ slug: movie.slug }));
}

export default async function MovieDetail({ params }: PageProps) {
  const { slug } = await params;
  const data = await getMovieBySlug(slug);
  if (!data) notFound();

  const { movie, episodes } = data;

  return (
    <main>
      <div className="container detailPage">
        <Link className="backLink" href="/">← Danh sách phim</Link>

        <section className="movieHero">
          <div className="detailPoster">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={movie.image} alt={movie.title} />
          </div>

          <div className="detailInfo">
            {movie.category && <div className="eyebrow">{movie.category}</div>}
            <h1>{movie.title}</h1>
            {movie.description && <p>{movie.description}</p>}
            <div className="detailMeta">
              <strong>{episodes.length}</strong>
              <span>tập phim</span>
            </div>
          </div>
        </section>

        <section className="episodesSection">
          <div className="sectionHeading">
            <div>
              <div className="eyebrow">EPISODES</div>
              <h2>Danh sách tập</h2>
            </div>
            <span>{episodes.length} tập</span>
          </div>

          {episodes.length > 0 ? (
            <div className="episodeList">
              {episodes.map((episode) => (
                <article className="episodeRow" key={episode.id}>
                  <div className="episodeNumber">{String(episode.episode).padStart(2, "0")}</div>
                  <div className="episodeMain">
                    <strong>{episode.title}</strong>
                    <span className={`platformBadge inline ${episode.platform}`}>
                      {platformLabel(episode.platform)}
                    </span>
                  </div>
                  <a className="episodeButton" href={episode.url} target="_blank" rel="noreferrer">
                    Xem phim <span aria-hidden="true">↗</span>
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <div className="emptyState">
              <strong>Chưa có tập phim.</strong>
              <span>Thêm tập vào sheet “episodes” trong data/movies.xlsx.</span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
