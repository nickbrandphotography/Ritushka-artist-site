import Image from 'next/image';

/**
 * Renders an optimised artwork/mockup/blog image via next/image (AVIF/WebP,
 * lazy-loading, no layout shift).
 *
 * `framed` wraps the image in a light-timber floating frame with a charcoal
 * reveal and a wall shadow — drawn in CSS so the source image stays clean
 * (important for Open Graph, zooming and future re-cropping). Mockup images
 * already contain a rendered frame, so they are left unframed.
 *
 * `bright` applies a small CSS brightness lift (see BRIGHT_FILTER below) — a
 * display-only correction, not a re-edit of the source photograph. Used
 * wherever the paintings themselves are shown (gallery cards, artwork
 * pages) after they read a shade underexposed on screen; NOT used for the
 * artist's own portrait photos or the mockup room-scene composites, which
 * nobody asked to have their exposure touched.
 *
 * 14% was chosen after comparing several strengths against both the darkest
 * and lightest paintings on the site — enough to read as a clear lift
 * without blowing out the near-whites in the lighter palette works.
 */
const BRIGHT_FILTER = 'brightness(1.14) contrast(1.03)';

export default function PlaceholderImage({
  src, alt, ratio = '4 / 3', priority, framed = false, sizes, quality, bright = false,
}: { src: string; alt: string; ratio?: string; priority?: boolean; framed?: boolean; sizes?: string; quality?: number; bright?: boolean }) {
  const picture = (
    <figure className="relative m-0 w-full overflow-hidden bg-sand" style={{ aspectRatio: ratio }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
        className="object-cover"
        style={bright ? { filter: BRIGHT_FILTER } : undefined}
        priority={priority}
        quality={quality}
      />
    </figure>
  );

  if (!framed) return picture;

  return (
    <div className="rt-frame">
      <div className="rt-reveal">{picture}</div>
    </div>
  );
}
