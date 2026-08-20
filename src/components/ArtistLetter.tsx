'use client';

import { Fragment, useId, useState } from 'react';
import AboutFigure, { type AboutFigureProps } from './AboutFigure';
import { letterEn, letterHu } from '@/content/artist-letter';

/**
 * "A word from the artist" — the artist's letter, with a one-click
 * English ⇄ Hungarian toggle ("Magyarok").
 *
 * Both language blocks are rendered into the DOM and toggled with the
 * `hidden` attribute rather than conditionally mounted, so search engines
 * and AI crawlers index both versions and each carries its own `lang`.
 */

/** Studio photographs floated into the letter, keyed by the paragraph they precede. */
const figures: Record<number, Omit<AboutFigureProps, 'side'> & { side: AboutFigureProps['side'] }> = {
  1: {
    src: '/about/ritushka-studio-bench.jpg',
    alt: 'Ritushka at her studio bench, surrounded by paint, brushes and finished abstract canvases',
    caption: 'At the bench — paint, brushes and the next idea',
    width: 739, height: 493, side: 'right', wide: true,
  },
  3: {
    src: '/about/ritushka-palette.jpg',
    alt: 'Ritushka mixing acrylic paint on a palette in front of a large abstract canvas',
    caption: 'Mixing on the palette',
    width: 707, height: 915, side: 'left',
  },
  6: {
    src: '/about/ritushka-studio-portrait.jpg',
    alt: 'Ritushka standing in her Lane Cove studio among large-scale abstract landscape paintings',
    caption: 'Twenty-six years later — the Australian studio',
    width: 742, height: 494, side: 'right', wide: true,
  },
  8: {
    src: '/about/ritushka-painting-canvas.jpg',
    alt: 'Ritushka painting the edge of a large canvas in her studio',
    caption: 'Working the edge of a large canvas',
    width: 742, height: 497, side: 'left', wide: true,
  },
};

const COPY = {
  en: {
    button: 'Magyarok',
    note: 'Read this letter in Hungarian',
    heading: 'A word from the artist',
    eyebrow: 'In her own words',
  },
  hu: {
    button: 'English',
    note: 'Olvasd angolul',
    heading: 'A művész szavaival',
    eyebrow: 'Saját szavaival',
  },
} as const;

function Body({ paragraphs, lang, hidden }: { paragraphs: string[]; lang: string; hidden: boolean }) {
  return (
    <div className="rt-editorial" lang={lang} hidden={hidden}>
      {paragraphs.map((p, i) => (
        <Fragment key={`${lang}-${i}`}>
          {figures[i] && <AboutFigure {...figures[i]} />}
          <p className={i === 0 ? 'rt-dropcap' : undefined}>{p}</p>
        </Fragment>
      ))}
    </div>
  );
}

export default function ArtistLetter() {
  const [isHu, setIsHu] = useState(false);
  const t = isHu ? COPY.hu : COPY.en;
  const sectionId = 'a-word-from-the-artist';
  const enId = useId();
  const huId = useId();

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-8">
          <h2 className="font-serif text-3xl text-ink md:text-4xl" lang={isHu ? 'hu' : 'en-AU'}>
            {t.heading}
          </h2>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-ink/65" lang={isHu ? 'hu' : 'en-AU'}>
            {t.eyebrow}
          </p>
        </div>
      </div>

      <div className="lg:col-span-7 lg:col-start-6">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            aria-pressed={isHu}
            aria-controls={`${enId} ${huId}`}
            onClick={() => {
              setIsHu(v => !v);
              document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="rt-lang-btn"
          >
            <svg className="rt-lang-flag" viewBox="0 0 6 3" aria-hidden="true" focusable="false">
              <rect width="6" height="1" y="0" fill="#ce2939" />
              <rect width="6" height="1" y="1" fill="#ffffff" />
              <rect width="6" height="1" y="2" fill="#477050" />
            </svg>
            <span>{t.button}</span>
          </button>
          <span className="text-[10.5px] uppercase tracking-[0.16em] text-ink/65" lang={isHu ? 'hu' : 'en-AU'}>
            {t.note}
          </span>
        </div>

        <figure className="rt-paper m-0">
          <div id={enId}>
            <Body paragraphs={letterEn} lang="en-AU" hidden={isHu} />
          </div>
          <div id={huId}>
            <Body paragraphs={letterHu} lang="hu" hidden={!isHu} />
          </div>

          <figcaption className="clear-both mt-8 border-t border-sand pt-5">
            <span className="block font-serif text-2xl text-ink">Ritushka</span>
            <span className="mt-1 block text-xs uppercase tracking-widest text-ink/65">Lane Cove, Sydney</span>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
