import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import PlaceholderImage from '@/components/PlaceholderImage';
import CtaBand from '@/components/CtaBand';
import JsonLd from '@/components/JsonLd';
import { site } from '@/site.config';
import { buildMetadata } from '@/lib/seo';
import { graph, personSchema, imageObjectSchema } from '@/lib/schema';

const PORTRAIT = site.artist.portraitPath;

export const metadata = buildMetadata({
  title: 'About The Artist',
  description:
    'Ritushka is a contemporary abstract landscape and seascape artist based in Lane Cove, Sydney. Born in communist Hungary, transformed by the Australian coast — her story, her practice, and a word in her own voice.',
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

/* --- Section 3: A word from the artist ----------------------------------- */
const letterParagraphs = [
  'Drawing from the depths of my memory, my career as an artist reaches all the way back to when I was four. I grew up in communist Hungary, in one of Budapest’s outer districts — Pesterzsébet, to be exact — in the middle of a concrete jungle, right next to lovely Csepel, which was maybe an even bigger dump than our own housing estate. A gold mine for proles and working stiffs; to us it was a wonderland, since we had no idea anything else existed. For a car or a landline you had to sit patiently on a waiting list for decades. The everyday view was rows of ten-storey blocks lined up in parallel, inside which thousands of families merrily lived out their lives in tiny flats. Stimulation, inspiration, visual experience: zero.',
  'I was one of the lucky ones, because I went to the famous purple kindergarten — the most colourful building in the whole district. That’s the source of my first memory, the one that left huge question marks in everyone’s mind. Day after day I just sat at the drawing table and daubed away. Every day I came home with the same masterpiece: a whale surfacing from the depths of the sea, cheerfully spraying a jet of water into the air. I hauled whales home by the ton… to the great astonishment of my kindergarten teacher and my parents, since I had never in my life laid eyes on a whale. Beyond Hungary’s great rivers and lakes, a puddle at most. A sea — or God forbid an ocean — not even in a picture. The origin of that inspiration is a mystery to this day.',
  'Drawing became the muse of my childhood. Our patient waiting eventually got its due reward too: a car, a phone, and the “world” opened up before us. We roamed, we travelled the country, and I spent my summers under my grandparents’ wings, watching their deft, industrious hands. My grandfather made oil paintings of professional quality; my grandmothers conjured up breathtaking handiwork — crochet, knitting, embroidered pictures; my great-grandfather built a miniature working steam locomotive out of “nothing.” Something exciting was always taking shape in their hands, and their urge to create ran through our days with untiring force. I was infected for life.',
  'As the years went by and my brain cells multiplied, I learned, mastered, and picked up everything from them by watching, and — setting all modesty aside — became a mini creator. At first my art-making was just something to kill the boredom in our limited, simple lives, but soon I grasped the essence of it. Creating is a wonder. I was unstoppable: I crocheted, knitted, embroidered, sewed, painted furniture, carved, sculpted with clay until I dropped.',
  'Then one day it simply passed. But it didn’t leave a void behind — it struck a spark of room for the great love: back from 3D into 2D.',
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
    inLanguage: 'en-AU',
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

      {/* --- Hero ------------------------------------------------------- */}
      <Container className="py-14">
        <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]} />
        <div className="mt-6 grid gap-12 lg:grid-cols-2 lg:items-center">
          <PlaceholderImage
            src={PORTRAIT}
            alt={`${site.artist.name}, contemporary abstract landscape and seascape artist, in her ${site.location.suburb} studio`}
            ratio="4 / 5"
            priority
          />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">{site.artist.tagline}</p>
            <h1 className="mt-3 font-serif text-4xl text-ink md:text-5xl">About {site.artist.name}</h1>
            <p className="mt-5 font-serif text-2xl leading-snug text-ink/85">
              Your world through my eyes.
            </p>
            <div className="prose-art mt-4">
              <p>{site.artist.shortBio}</p>
              <p>
                Born in Budapest and now painting from a studio in {site.location.suburb}, {site.location.city},
                Ritushka builds large abstract landscapes and seascapes in translucent layers, drawing on
                Australian coastline, light and weather. Her work is held in private and corporate collections
                worldwide and is specified by interior designers and architects for residential and commercial
                projects.
              </p>
            </div>
            <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-sand pt-5 text-xs uppercase tracking-widest text-ink/60">
              {sections.map(s => (
                <a key={s.id} href={`#${s.id}`} className="hover:text-ink">
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </Container>

      {/* --- 1. About the art ------------------------------------------- */}
      <section id="about-the-art" className="scroll-mt-24 border-t border-sand">
        <Container className="py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-serif text-3xl text-ink md:text-4xl">About the art</h2>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <p className="font-serif text-2xl leading-snug text-ink md:text-3xl">{artParagraphs[0]}</p>
              <div className="prose-art mt-6">
                {artParagraphs.slice(1).map(p => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
              <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-widest text-ink/60">
                <Link href="/available" className="hover:text-ink">Available works</Link>
                <Link href="/collections" className="hover:text-ink">Collections</Link>
                <Link href="/commission" className="hover:text-ink">Commission a painting</Link>
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* --- 2. About the artist ---------------------------------------- */}
      <section id="about-the-artist" className="scroll-mt-24 border-t border-sand bg-white/40">
        <Container className="py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-serif text-3xl text-ink md:text-4xl">About the artist</h2>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-ink/50">
                Ritushka Pure Art — your world through my eyes
              </p>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <div className="prose-art">
                {artistParagraphs.map(p => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>

              <blockquote className="my-10 border-l-2 border-accent pl-6">
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

              <p className="mt-8 border-t border-sand pt-5 text-sm text-ink/60">
                <span className="block font-serif text-base text-ink">Ritushka Pure Art</span>
                Acrylic on canvas. Abstract landscapes of the soul. Based in Australia, born of Hungary,
                dreaming in colour.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* --- 3. A word from the artist ---------------------------------- */}
      <section id="a-word-from-the-artist" className="scroll-mt-24 border-t border-sand">
        <Container className="py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-serif text-3xl text-ink md:text-4xl">A word from the artist</h2>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-ink/50">In her own words</p>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <figure className="m-0 rounded-lg border border-sand bg-bone p-6 md:p-10">
                <blockquote className="prose-art">
                  {letterParagraphs.map(p => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </blockquote>
                <figcaption className="mt-8 border-t border-sand pt-5">
                  <span className="block font-serif text-2xl text-ink">{site.artist.name}</span>
                  <span className="mt-1 block text-xs uppercase tracking-widest text-ink/55">
                    {site.location.suburb}, {site.location.city}
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand
        title="Acquire or commission"
        body="Browse available originals or commission a work for your space."
        primary={{ href: '/available', label: 'Available works' }}
        secondary={{ href: '/commission', label: 'Commission' }}
      />
    </>
  );
}
