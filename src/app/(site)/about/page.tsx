import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import PlaceholderImage from '@/components/PlaceholderImage';
import AboutFigure from '@/components/AboutFigure';
import ArtistLetter from '@/components/ArtistLetter';
import CtaBand from '@/components/CtaBand';
import JsonLd from '@/components/JsonLd';
import { site } from '@/site.config';
import { buildMetadata } from '@/lib/seo';
import { graph, personSchema, imageObjectSchema } from '@/lib/schema';

const PORTRAIT = site.artist.portraitPath;

export const metadata = buildMetadata({
  title: 'About The Artist',
  description:
    'Ritushka is a contemporary abstract landscape and seascape artist based in Lane Cove, Sydney. Born in communist Hungary, transformed by the Australian coast — her story, her practice, and a word in her own voice, in English and Hungarian.',
  path: '/about',
  image: PORTRAIT,
});

/* --- Section 1: About the art -------------------------------------------- */
const artParagraphs = [
  'Large-scale abstract landscapes designed to make an impact within a space.',
  'Rich colour, texture and movement create artwork that works beautifully as a statement piece or as part of a considered interior.',
  'Every work is an original acrylic on canvas — hand-painted, signed and accompanied by a certificate of authenticity, and shipped worldwide, fully insured. Commissions are welcomed for bespoke size, palette and scale.',
];

/* --- Section 2: About the artist ----------------------------------------- */
const artistParagraphs = [
  'Somewhere between the grey concrete of a Hungarian winter and the explosive, endless blue of an Australian sky, Ritushka learned to speak without words.',
  'She does not paint what she sees. She paints what remained after everything else was stripped away.',
  'Long before she ever touched a canvas, there was a grandfather’s easel in a corner of a quiet room — turpentine and linseed oil, a silent inheritance. At four years old, Ritushka was already drawing. Not toys or houses. Shapes. Shadows. The spaces between things. Even then, she understood that a line could be a door.',
  'By fourteen, she had abandoned the figure entirely. Non-figurative pastels exploded across cheap paper — not chaos, but a private language. At sixteen, she pulled back. The world demanded precision, so she gave it black and white detailed ink: furious, intricate, obsessive. Every line a cage. Every cross-hatch an escape attempt.',
  'Then came the pastels again at twenty, but now layered with ink. Structure bleeding into emotion. The head and the heart finally arguing on the same page.',
  'For a decade — her thirties to forties — Ritushka vanished into other people’s worlds: custom, vivid, colour-drenched children’s artwork. Whimsical. Joyful. Beautiful. But secretly, she was mapping something else. Every commission taught her how far imagination could stretch before it broke.',
  'And then: Willoughby Art School.',
  'She walked in expecting technique. She walked out ruined in the best possible way. Abstract painting didn’t just find her — it cracked her open. Suddenly, all those years of interior design in Hungary, all those years of balancing commercial work (over 300 pieces completed, 200 of them sold commercially), all those years of sketching at market stalls and painting on commission… it all collapsed into now.',
  'But the real shift happened when she landed in Australia.',
  'You cannot understand Ritushka Pure Art until you understand where she came from: a communist childhood where life was deliberately dry, empty, beige. Escapism wasn’t a hobby. It was survival. As a teenager, travel and nature became her oxygen. As an adult? Australia made her bloom like a flower that forgot it had seeds.',
  'The landscape. The colour. The space. The raw, peeling, ancient textures of bark and dust and salt-crusted earth. So far removed from the bleak Hungarian city of her youth that she felt like a spy in paradise.',
  'Ritushka does not want you to understand her paintings.',
  'She wants you to fall into them.',
  'She wants to show you the world through her eyes — not to explain it, but to offer you a key. Every acrylic pour, every layered scrape, every sudden rupture of colour is an invitation. An open door. A dare.',
];

const artistParagraphsAfterQuote = [
  'Today, Ritushka Pure Art exists as a bridge between two lifetimes: the grey and the glorious, the controlled and the chaotic, the ink and the explosion. Her work hangs in private collections and commercial spaces across the world. But the real collection? It’s still forming. Still moving. Still just out of reach.',
];

/** Studio photographs floated into "About the artist", keyed by the paragraph they precede. */
const artistFigures = {
  2: {
    src: '/about/ritushka-champagne.jpg',
    alt: 'Ritushka seated in her Lane Cove studio, in front of her abstract paintings',
    caption: 'Ritushka in her Lane Cove studio',
    width: 1600, height: 1067, side: 'right' as const, wide: true,
  },
  5: {
    src: '/about/ritushka-brushwork.jpg',
    alt: 'Close-up of Ritushka building a textured pink and gold abstract surface with a brush',
    caption: 'Building the surface, layer on layer',
    width: 705, height: 1060, side: 'left' as const,
  },
  9: {
    src: '/about/ritushka-studio-wide.jpg',
    alt: 'Ritushka’s studio with large abstract landscape and seascape canvases stacked wall to wall',
    caption: 'Works in progress, wall to wall',
    width: 746, height: 495, side: 'right' as const, wide: true,
  },
} as const;

const stats = [
  { figure: '300+', label: 'Works completed' },
  { figure: '3', label: 'Continents collected' },
  { figure: '26 yrs', label: 'In Australia' },
];

const sections = [
  { id: 'about-the-art', label: 'About the art' },
  { id: 'about-the-artist', label: 'About the artist' },
  { id: 'a-word-from-the-artist', label: 'A word from the artist' },
];

export default function About() {
  const person = {
    ...personSchema(),
    birthPlace: { '@type': 'Place', name: 'Budapest, Hungary' },
    alumniOf: { '@type': 'EducationalOrganization', name: 'Willoughby Art School' },
    knowsLanguage: ['en-AU', 'hu'],
    homeLocation: {
      '@type': 'Place',
      name: `${site.location.suburb}, ${site.location.city}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: site.location.suburb,
        addressRegion: site.location.state,
        addressCountry: site.location.countryCode,
      },
    },
  };

  const aboutPage = {
    '@type': ['AboutPage', 'ProfilePage'],
    '@id': new URL('/about', site.url).toString() + '#about',
    url: new URL('/about', site.url).toString(),
    name: `About ${site.artist.name}`,
    description: metadata.description as string,
    inLanguage: ['en-AU', 'hu'],
    isPartOf: { '@id': new URL('/', site.url).toString() + '#website' },
    mainEntity: { '@id': new URL('/', site.url).toString() + '#person' },
    primaryImageOfPage: new URL(PORTRAIT, site.url).toString(),
  };

  return (
    <>
      <JsonLd
        data={graph(
          person,
          aboutPage,
          imageObjectSchema(PORTRAIT, `${site.artist.name}, contemporary abstract landscape and seascape artist, ${site.location.suburb}, ${site.location.city}`),
        )}
      />

      {/* --- Hero (portrait unchanged) ----------------------------------- */}
      <Container className="py-14">
        <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]} />
        <div className="mt-6 grid gap-12 lg:grid-cols-[0.85fr_1fr] lg:items-center lg:gap-16">
          <div className="relative">
            <PlaceholderImage
              src={PORTRAIT}
              alt={`${site.artist.name}, contemporary abstract landscape and seascape artist, in her ${site.location.suburb} studio`}
              ratio="4 / 5"
              priority
              // Without this, PlaceholderImage's default sizes fallback
              // ("33vw" at desktop widths) badly under-states how wide this
              // renders in the 0.85fr/1fr grid below (really ~44-46% of the
              // container, capped at ~529px once Container's max-width
              // caps out) — next/image was serving a too-small srcset
              // candidate and the browser stretched it, reading as blur.
              sizes="(max-width: 1023px) 100vw, (min-width: 1280px) 529px, 44vw"
              // Smooth continuous-tone content — skin, and the heavily blurred
              // bokeh background — shows next/image's default q=75 recompression
              // far more readily than the site's other photos (mostly textured
              // paintings/studio shots, where compression artifacts hide in the
              // texture). Bump quality specifically for this image rather than
              // sitewide, since q=75 reads fine everywhere else.
              quality={95}
            />
            <span className="absolute bottom-4 left-0 bg-bone px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-ink/65">
              {site.artist.name} · {site.location.suburb}, {site.location.city}
            </span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/65">{site.artist.tagline}</p>
            <h1 className="mt-3 font-serif text-4xl text-ink md:text-5xl">About {site.artist.name}</h1>
            <p className="mt-5 font-serif text-2xl italic leading-snug text-ink/85">
              Your world through my eyes.
            </p>
            <div className="prose-art mt-4 max-w-[56ch]">
              <p>{site.artist.shortBio}</p>
              <p>
                Born in Budapest and now painting from a studio in {site.location.suburb}, {site.location.city},
                Ritushka builds large abstract landscapes and seascapes in translucent layers, drawing on
                Australian coastline, light and weather. Her work is held in private and corporate collections
                worldwide and is specified by interior designers and architects for residential and commercial
                projects.
              </p>
            </div>

            <dl className="mt-8 flex flex-wrap border-t border-sand">
              {stats.map(s => (
                <div key={s.label} className="min-w-[130px] flex-1 pr-5 pt-4">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="m-0">
                    <span className="block font-serif text-3xl text-ink">{s.figure}</span>
                    <span className="mt-1 block text-[10.5px] uppercase tracking-[0.16em] text-ink/65">
                      {s.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-sand pt-5 text-xs uppercase tracking-widest text-ink/65">
              {sections.map(s => (
                <a key={s.id} href={`#${s.id}`} className="hover:text-ink">
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </Container>

      {/* --- 1. About the art -------------------------------------------- */}
      <section id="about-the-art" className="scroll-mt-24 border-t border-sand">
        <Container className="py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-serif text-3xl text-ink md:text-4xl lg:sticky lg:top-8">About the art</h2>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <p className="font-serif text-2xl leading-snug text-ink md:text-3xl">{artParagraphs[0]}</p>
              <div className="prose-art mt-6">
                {artParagraphs.slice(1).map(p => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
              <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-widest text-ink/65">
                <Link href="/available" className="hover:text-ink">Available works</Link>
                <Link href="/collections" className="hover:text-ink">Collections</Link>
                <Link href="/commission" className="hover:text-ink">Commission a painting</Link>
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* --- 2. About the artist ----------------------------------------- */}
      <section id="about-the-artist" className="scroll-mt-24 border-t border-sand bg-white/40">
        <Container className="py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-8">
                <h2 className="font-serif text-3xl text-ink md:text-4xl">About the artist</h2>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-ink/65">
                  Ritushka Pure Art — your world through my eyes
                </p>
              </div>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <div className="rt-editorial">
                {artistParagraphs.map((p, i) => {
                  const fig = artistFigures[i as keyof typeof artistFigures];
                  return (
                    <Fragment key={p.slice(0, 24)}>
                      {fig && <AboutFigure {...fig} />}
                      <p className={i === 0 ? 'rt-dropcap' : undefined}>{p}</p>
                    </Fragment>
                  );
                })}
              </div>

              <blockquote className="clear-both my-10 border-l-2 border-accent pl-6">
                <p className="font-serif text-2xl leading-snug text-ink md:text-3xl">
                  “Explore your own imagination. I’ve already given you mine.”
                </p>
              </blockquote>

              <div className="prose-art">
                {artistParagraphsAfterQuote.map(p => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>

              <p className="mt-10 font-serif text-2xl leading-relaxed text-ink">
                Come closer.
                <br />
                You don’t need to know where it starts.
                <br />
                Only where it takes you.
              </p>

              <p className="mt-8 border-t border-sand pt-5 text-sm text-ink/65">
                <span className="block font-serif text-base text-ink">Ritushka Pure Art</span>
                Acrylic on canvas. Abstract landscapes of the soul. Based in Australia, born of Hungary,
                dreaming in colour.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* --- Studio strip -------------------------------------------------- */}
      <figure className="relative m-0 border-t border-sand">
        <div className="relative h-[clamp(240px,38vw,440px)] w-full">
          <Image
            src="/about/ritushka-studio-portrait.jpg"
            alt={`Ritushka’s studio in ${site.location.suburb}, ${site.location.city}, with large-scale abstract canvases stacked wall to wall`}
            fill
            sizes="100vw"
            className="object-cover object-[50%_46%]"
          />
        </div>
        <figcaption className="absolute bottom-4 left-5 bg-bone/90 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-ink/65 sm:left-8">
          The studio, {site.location.suburb}
        </figcaption>
      </figure>

      {/* --- 3. A word from the artist (EN ⇄ HU) --------------------------- */}
      <section id="a-word-from-the-artist" className="scroll-mt-24 border-t border-sand">
        <Container className="py-14 md:py-20">
          <ArtistLetter />
        </Container>
      </section>

      <CtaBand
        title="Acquire or commission"
        body="Browse available originals or commission a work made for the scale, palette and light of your space."
        primary={{ href: '/available', label: 'Available works' }}
        secondary={{ href: '/commission', label: 'Commission' }}
      />
    </>
  );
}
