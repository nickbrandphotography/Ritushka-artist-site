'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Close the menu on navigation
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Escape closes the menu and returns focus to the toggle; opening moves
  // focus into the panel so keyboard and screen-reader users land somewhere
  // useful rather than in the still-visually-hidden page behind it.
  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const panel = (
    <div
      id="mobile-menu"
      className="fixed inset-x-0 top-16 bottom-0 z-[60] overflow-y-auto border-t border-sand bg-bone md:hidden"
    >
      <nav aria-label="Mobile" className="px-5 py-6">
        <ul className="flex flex-col divide-y divide-sand">
          {items.map((n, i) => (
            <li key={n.href}>
              <Link
                href={n.href}
                ref={i === 0 ? firstLinkRef : undefined}
                onClick={() => setOpen(false)}
                className="block py-4 font-serif text-2xl text-ink"
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  return (
    <div className="md:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(v => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-ink"
      >
        <span className="relative block h-3.5 w-5">
          <span className={`absolute left-0 top-0 h-0.5 w-5 bg-ink transition-transform ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`absolute left-0 top-[6px] h-0.5 w-5 bg-ink transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`absolute left-0 top-[12px] h-0.5 w-5 bg-ink transition-transform ${open ? '-translate-y-[5px] -rotate-45' : ''}`} />
        </span>
      </button>

      {mounted && open && createPortal(panel, document.body)}
    </div>
  );
}
