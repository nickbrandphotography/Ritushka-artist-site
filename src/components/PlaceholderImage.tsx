import Image from 'next/image';

/**
 * Renders an optimised artwork/mockup/blog image via next/image (AVIF/WebP,
 * lazy-loading, no layout shift).
 *
 * `framed` wraps the image in a light-timber floating frame with a charcoal
 * reveal and a wall shadow — drawn in CSS so the source image stays clean
 * (important for Open Graph, zooming and future re-cropping). Mockup images
 * already contain a rendered frame, so they are left unframed.
 */
export default function PlaceholderImage({
  src, alt, ratio = '4 / 3', priority, framed = false, sizes,
}: { src: string; alt: string; ratio?: string; priority?: boolean; framed?: boolean; sizes?: string }) {
  const picture = (
    <figure className="relative m-0 w-full overflow-hidden bg-sand" style={{ aspectRatio: ratio }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
        className="object-cover"
        priority={priority}
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
