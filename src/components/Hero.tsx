import Link from 'next/link';
import Image from 'next/image';
import { site } from '@/site.config';
import { getArtwork } from '@/lib/data';

/**
 * Homepage hero — a full-bleed artwork banner above a centred typographic
 * statement.
 *
 * The banner files in /public/hero are art-directed crops of ONE painting
 * (HERO_SLUG below), exported at two shapes:
 *   hero-wide   3840 x 1280 (3:1)  — desktop, shown uncropped at 1440 x 900
 *   hero-mobile 1600 x 2000 (4:5)  — phones uncropped; tablets trimmed to 4:3
 * Both are served as AVIF / WebP / JPEG at two widths via <picture>, so the
 * browser picks the crop by viewport and the format by support. Art direction
 * of this kind is what <picture> exists for — next/image cannot swap the
 * source image on a media query. To swap the featured painting, change
 * HERO_SLUG and re-export both banner files at the sizes above.
 *
 * Layout rules live in globals.css under `.rt-hero`.
 */
const HERO_SLUG = 'rushing-shallows';

const WIDE = '/hero/hero-wide';
const TALL = '/hero/hero-mobile';
/** Below this width the portrait crop is used (phones and tablet portrait). */
const PORTRAIT_UP_TO = '(max-width: 1023px)';

export default function Hero() {
  const feature = getArtwork(HERO_SLUG);
  const alt =
    feature?.alt ??
    `Abstract seascape painting by ${site.artist.name}`;

  const banner = (
    <picture>
      <source media={PORTRAIT_UP_TO} type="image/avif" srcSet={`${TALL}-900.avif 900w, ${TALL}-1600.avif 1600w`} sizes="100vw" />
      <source media={PORTRAIT_UP_TO} type="image/webp" srcSet={`${TALL}-900.webp 900w, ${TALL}-1600.webp 1600w`} sizes="100vw" />
      <source media={PORTRAIT_UP_TO} srcSet={`${TALL}-900.jpg 900w, ${TALL}-1600.jpg 1600w`} sizes="100vw" />
      <source type="image/avif" srcSet={`${WIDE}-1920.avif 1920w, ${WIDE}-3840.avif 3840w`} sizes="100vw" />
      <source type="image/webp" srcSet={`${WIDE}-1920.webp 1920w, ${WIDE}-3840.webp 3840w`} sizes="100vw" />
      {/* eslint-disable-next-line @next/next/no-img-element -- art-directed
          <picture> with per-breakpoint crops; next/image can't swap source
          images on a media query, see the file header comment above. */}
      <img
        src={`${WIDE}-3840.jpg`}
        srcSet={`${WIDE}-1920.jpg 1920w, ${WIDE}-3840.jpg 3840w`}
        sizes="100vw"
        alt={alt}
        width={3840}
        height={1280}
        fetchPriority="high"
        decoding="async"
      />
    </picture>
  );

  return (
    <section className="rt-hero border-b border-sand">
      <figure className="rt-hero__art">
        {feature ? <Link href={`/artwork/${feature.slug}`}>{banner}</Link> : banner}
      </figure>

      <div className="rt-hero__type">
        <p className="rt-hero__eyebrow">
          {site.location.suburb} &middot; {site.location.city} &middot; {site.location.country}
        </p>

        <h1 className="rt-hero__h1">
          <Image
            className="rt-hero__sig"
            src="/hero/signature-ink.png"
            alt={site.artist.name}
            width={2302}
            height={401}
            // Mirrors the CSS `width: clamp(210px, 23vw, 318px)` on .rt-hero__sig
            // exactly (crossover points are 210/0.23 ≈ 913px and 318/0.23 ≈ 1383px).
            // A looser hint like a flat "30vw" under-reported the true display
            // width on phones, so next/image served a lower-resolution srcset
            // candidate than the element's actual CSS size × device pixel ratio
            // needed (Lighthouse: "Serves images with low resolution").
            sizes="(min-width: 1383px) 318px, (min-width: 913px) 23vw, 210px"
          />
          <span className="rt-hero__statement">
            Contemporary abstract landscapes <span className="rt-hero__brk" />&amp; seascapes
          </span>
        </h1>

        <p className="rt-hero__lede">
          Original large-scale works and private commissions for collectors, interior
          designers and architects. Studio viewings by appointment; shipped worldwide.
        </p>

        <div className="rt-hero__cta">
          <Link href="/available" className="rounded-full bg-ink px-7 py-3.5 text-sm text-bone">
            View available works
          </Link>
          <Link href="/commission" className="text-sm underline underline-offset-4">
            Commission a painting
          </Link>
        </div>
      </div>
    </section>
  );
}
