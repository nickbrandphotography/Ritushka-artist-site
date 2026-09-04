import { site } from '@/site.config';

/**
 * Available Works banner — a shallow full-bleed detail crop, half the depth
 * of the homepage hero (see Hero.tsx header comment for that geometry).
 *
 * Homepage hero:  3840 x 1280 (3:1)
 * This banner:    3840 x  640 (6:1) — same width tiers, half the height.
 *
 * Unlike the homepage hero, this uses ONE crop at every breakpoint (no
 * separate portrait mobile file) — a secondary listing page reads better as
 * a consistently shallow band than as a near-full-screen entrance visual, so
 * the same landscape crop just narrows via object-fit: cover on small
 * screens. Layout rules live in globals.css under `.rt-avail-banner`.
 */
const BASE = '/available/available-banner';

export default function AvailableBanner() {
  return (
    <section className="rt-avail-banner border-b border-sand">
      <picture>
        <source type="image/avif" srcSet={`${BASE}-1920.avif 1920w, ${BASE}-3840.avif 3840w`} sizes="100vw" />
        <source type="image/webp" srcSet={`${BASE}-1920.webp 1920w, ${BASE}-3840.webp 3840w`} sizes="100vw" />
        {/* eslint-disable-next-line @next/next/no-img-element -- <picture>
            source-set for AVIF/WebP/JPEG at two widths; next/image can't
            express this multi-format srcset. */}
        <img
          src={`${BASE}-3840.jpg`}
          srcSet={`${BASE}-1920.jpg 1920w, ${BASE}-3840.jpg 3840w`}
          sizes="100vw"
          alt={`Detail of an abstract seascape painting by ${site.artist.name}, in turquoise and ochre`}
          width={3840}
          height={640}
          decoding="async"
        />
      </picture>
    </section>
  );
}
