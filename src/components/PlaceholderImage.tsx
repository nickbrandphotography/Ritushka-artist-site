import Image from 'next/image';

/**
 * Renders an optimised artwork/mockup/blog image via next/image (AVIF/WebP,
 * lazy-loading, no layout shift). Sample images ship in /public; replace any
 * file at the same path with a real photograph and nothing else needs to change.
 */
export default function PlaceholderImage({
  src, alt, ratio = '4 / 3', priority,
}: { src: string; alt: string; ratio?: string; priority?: boolean }) {
  return (
    <figure className="relative m-0 w-full overflow-hidden rounded-sm bg-sand" style={{ aspectRatio: ratio }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        priority={priority}
      />
    </figure>
  );
}
