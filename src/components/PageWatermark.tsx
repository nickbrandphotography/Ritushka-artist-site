/**
 * Full-page background watermark, pinned behind the content as the page
 * scrolls (the "text scrolls over a fixed background" effect).
 *
 * This does NOT use `background-attachment: fixed` on the background-image
 * itself — that's a long-standing, still-current iOS Safari bug: Safari
 * positions the background correctly on load but never repaints it as you
 * pan/scroll, and it doesn't reliably combine with `background-size: cover`
 * either. Confirmed still present as of iOS 18 (see sources in the commit
 * that introduced this file).
 *
 * Instead this uses the established, widely-used workaround: a genuinely
 * `position: fixed` element with an EXPLICIT negative `z-index`, per
 * https://css-tricks.com/the-fixed-background-attachment-hack/ — the
 * previous attempt at this used `position: fixed` too, but left z-index at
 * its default ("auto") and relied only on DOM order to paint the content on
 * top. That's spec-correct, but mobile browsers commonly promote `fixed`
 * elements to their own GPU compositing layer for scroll performance, and
 * with z-index left ambiguous, that layer painted ABOVE the real content on
 * a real Android phone — the exact opposite bug from the iOS one. An
 * explicit z-index removes that ambiguity rather than depending on the
 * browser to infer the right order.
 */
export default function PageWatermark({
  src, position = 'center', children,
}: { src: string; position?: string; children: React.ReactNode }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${src})`, backgroundPosition: position }}
      />
      {children}
    </>
  );
}
