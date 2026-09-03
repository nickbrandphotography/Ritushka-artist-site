/**
 * Full-page background watermark, pinned behind the content as the page
 * scrolls.
 *
 * This deliberately does NOT use `background-attachment: fixed` on the
 * background-image itself — iOS Safari has never reliably supported that
 * property (historically ignored it outright; on current versions it's
 * still prone to not staying pinned, or to visible jumping/flicker as the
 * address bar shows and hides). A genuinely `position: fixed` element does
 * not have this problem; it's one of the most widely and consistently
 * supported CSS behaviours there is (it's what sticky headers, modals etc.
 * already rely on everywhere, iOS included).
 *
 * The background div is placed first in source order with no z-index at
 * all — normal DOM stacking already paints the content after it on top,
 * which avoids the negative-z-index pitfalls of interacting with other
 * positioned elements on the page (e.g. the site header).
 */
export default function PageWatermark({
  src, position = 'center', children,
}: { src: string; position?: string; children: React.ReactNode }) {
  return (
    <>
      <div
        aria-hidden="true"
        // pointer-events-none: belt-and-braces — the content already paints
        // over this in normal DOM/stacking order so it shouldn't intercept
        // clicks anywhere real content sits, but this rules it out entirely
        // rather than relying on that alone.
        className="pointer-events-none fixed inset-0 bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${src})`, backgroundPosition: position }}
      />
      {children}
    </>
  );
}
