import type { BannerAd } from "@/lib/banner-ads";

export default function BannerCard({ ad, wide = false }: { ad: BannerAd; wide?: boolean }) {
  const content = (
    <>
      <span className="adLabel">Quảng cáo</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ad.image} alt={ad.alt} loading="lazy" />
    </>
  );

  return (
    <article className={`movieCard bannerCard${wide ? " bannerCardWide" : ""}`} aria-label="Quảng cáo">
      {ad.url ? (
        <a href={ad.url} target="_blank" rel="no-index sponsored nofollow noopener noreferrer" className="bannerLink">
          {content}
        </a>
      ) : (
        <div className="bannerLink">{content}</div>
      )}
    </article>
  );
}
