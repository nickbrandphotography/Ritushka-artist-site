// Deterministic content generator. Re-run: `node scripts/generate-data.mjs`
// Scales to 500+ artworks by changing N_ARTWORKS — no architectural change.
import { writeFileSync, mkdirSync } from 'node:fs';
mkdirSync('src/data', { recursive: true });

const N_ARTWORKS = 50;
const N_MOCKUPS = 50;
const N_BLOG = 50;

// seeded pseudo-random for reproducibility
let seed = 1337;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const pick = (a) => a[Math.floor(rnd() * a.length)];
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const collections = [
  { name: 'Abstract Landscapes', keyword: 'abstract landscape art', intent: 'collectors seeking contemporary abstract landscape paintings' },
  { name: 'Abstract Seascapes', keyword: 'abstract seascape paintings', intent: 'buyers of coastal and ocean abstract art' },
  { name: 'Large Scale Paintings', keyword: 'large scale art', intent: 'designers and architects sourcing oversized statement works' },
  { name: 'Coastal Abstract Art', keyword: 'coastal abstract art', intent: 'luxury coastal home owners' },
  { name: 'Ocean Inspired Paintings', keyword: 'ocean inspired paintings', intent: 'collectors drawn to the sea' },
  { name: 'Contemporary Landscape Art', keyword: 'contemporary landscape art', intent: 'modern interiors' },
  { name: 'Textured Abstract Paintings', keyword: 'textured abstract paintings', intent: 'collectors who value materiality and impasto' },
  { name: 'Blue Abstract Paintings', keyword: 'blue abstract paintings', intent: 'colour-led buyers' },
  { name: 'Modern Australian Art', keyword: 'modern australian art', intent: 'buyers seeking Australian provenance' },
  { name: 'Statement Artworks', keyword: 'statement artwork', intent: 'corporate and luxury commissions' },
];

const titleA = ['Coastal','Tidal','Horizon','Saltwater','Pacific','Northern','Quiet','Distant','Morning','Drift','Headland','Estuary','Shoreline','Windward','Sea','Stone','Cloud','Field','Dune','Harbour','Marble','Echo','Low','High','Pale'];
const titleB = ['Rhythm','Memory','Drift','Light','Veil','Current','Threshold','Passage','Bloom','Reverie','Expanse','Murmur','Tempo','Hush','Fold','Tide','Cadence','Verge','Atlas','Span','Mirage','Whisper','Crest','Hollow','Sound'];
const mediums = ['Acrylic and mixed media on Belgian linen','Oil and cold wax on canvas','Acrylic, marble dust and pigment on linen','Mixed media and oil on deep-edge canvas','Acrylic with raw pigment on cotton canvas'];
const palettes = ['soft bone whites, sea-foam and deep ocean blue','warm sand, ochre and chalk','slate greys, mist and pale silver','indigo, teal and bleached coral','charcoal, fog and muted gold'];
const sizes = [[1520,1020],[1830,1220],[2000,1500],[1000,1000],[1370,1830],[2400,1200],[900,1200],[1830,1830],[760,1015],[2100,1400]];
const statuses = ['available','available','available','sold','reserved'];

function paragraph(t, coll, palette) {
  return `${t} belongs to Ritushka's ${coll} series, an exploration of ${palette}. Built in translucent layers, the surface is worked back and rebuilt so light appears to move across it — a quality that rewards large walls and considered placement. The painting reads as a remembered place rather than a literal one, holding the calm and scale that collectors, interior designers and architects look for in contemporary abstract work.`;
}

const artworks = [];
const usedSlugs = new Set();
for (let i = 0; i < N_ARTWORKS; i++) {
  let title, slug;
  do { title = `${pick(titleA)} ${pick(titleB)}`; slug = slugify(title); } while (usedSlugs.has(slug));
  usedSlugs.add(slug);
  const coll = collections[i % collections.length];
  const secondary = collections[(i * 3 + 1) % collections.length];
  const [w, h] = pick(sizes);
  const medium = pick(mediums);
  const palette = pick(palettes);
  const status = pick(statuses);
  const year = 2023 + (i % 4);
  const priceBase = 2400 + Math.round((w * h) / 9000) * 100;
  artworks.push({
    id: `aw-${String(i + 1).padStart(3, '0')}`,
    slug, title, year, medium,
    widthMm: w, heightMm: h,
    widthCm: Math.round(w / 10), heightCm: Math.round(h / 10),
    palette,
    collections: [slugify(coll.name), slugify(secondary.name)],
    primaryCollection: slugify(coll.name),
    status,
    price: status === 'sold' ? null : priceBase,
    currency: 'AUD',
    orientation: w > h ? 'landscape' : w < h ? 'portrait' : 'square',
    story: paragraph(title, coll.name, palette),
    shortDescription: `${title} — ${Math.round(w/10)} × ${Math.round(h/10)}cm original ${coll.name.toLowerCase()} painting by Ritushka. ${status === 'sold' ? 'Sold; commission a related work.' : 'Available now, shipped worldwide.'}`,
    seoTitle: `${title} | Original ${coll.name} Painting by Ritushka`,
    metaDescription: `${title}, a ${Math.round(w/10)}×${Math.round(h/10)}cm original ${coll.keyword} by Sydney artist Ritushka. ${status === 'available' ? 'Available now.' : status === 'sold' ? 'Sold — similar commissions available.' : 'Reserved.'} Worldwide shipping & certificate of authenticity.`,
    image: `/artworks/${slug}.jpg`,
    alt: `${title}, original ${coll.keyword} on canvas by Ritushka, ${Math.round(w/10)} by ${Math.round(h/10)} centimetres`,
    mockups: [],
  });
}

// Mockups: each links to an artwork
const rooms = ['Living Room','Luxury Home','Coastal Home','Modern Apartment','Architectural Interior','Commercial Space','Designer Space','Penthouse','Hotel Lobby','Boardroom'];
const mockups = [];
for (let i = 0; i < N_MOCKUPS; i++) {
  const aw = artworks[i % artworks.length];
  const room = rooms[i % rooms.length];
  const slug = slugify(`${aw.slug}-in-${room}-${i + 1}`);
  mockups.push({
    id: `mk-${String(i + 1).padStart(3, '0')}`,
    slug, room,
    artworkSlug: aw.slug,
    title: `${aw.title} in a ${room}`,
    image: `/mockups/${slug}.jpg`,
    alt: `${aw.title} by Ritushka displayed in a ${room.toLowerCase()} — ${aw.palette}`,
    seoTitle: `${aw.title} Styled in a ${room} | Ritushka`,
    metaDescription: `See ${aw.title} by Ritushka styled in a ${room.toLowerCase()}. Scale, palette and placement reference for collectors and interior designers. Enquire to acquire or commission.`,
  });
  aw.mockups.push(slug);
}

// Blog
const blogTitles = [
 'How To Choose Art For A Large Wall','Original Art vs Prints: What Collectors Should Know','How Interior Designers Source Original Artwork','Large Scale Art For Luxury Homes','How To Commission An Abstract Painting','Best Art For Coastal Homes','The Complete Art Placement Guide','Is Original Art A Good Investment?','How To Hang Oversized Paintings','Choosing Art That Increases With Value','Abstract Art For Minimalist Interiors','How Architects Specify Art For New Builds','Art For Property Developers: Display Suites That Sell','Colour Theory For Choosing Abstract Art','How To Care For An Acrylic Painting','Framing vs Unframed: Contemporary Canvas Art','Sourcing Australian Art For Global Interiors','How Art Consultants Work With Collectors','Commissioning Art For A Corporate Lobby','Coastal Colour Palettes In Contemporary Art',
 'How To Build A Cohesive Art Collection','Statement Art For Double-Height Walls','Buying Art As An Interior Designer: A Workflow','Texture And Materiality In Abstract Painting','How To Light A Large Painting','Art For Hotels And Hospitality Spaces','Understanding Certificates Of Authenticity','How To Photograph Art For A Listing','Best Blue Paintings For Calm Interiors','Sizing Art To A Sofa Or Console','How To Work With An Artist On A Commission','Art Shipping And Insurance Explained','Why Linen Canvas Matters','The Difference Between Landscape And Seascape Abstraction','Curating Art For A Coastal New Build','How Buyers Agents Add Value With Art','Art Trends In Luxury Australian Homes','How To Price Original Art','Galleries vs Buying Direct From The Artist','Building An Art Wall In An Open Plan Home',
 'Choosing Art For Resale-Ready Homes','How To Commission A Diptych Or Triptych','Neutral Art For Warm Minimalism','Art For Architectural Concrete Interiors','How Designers Present Art To Clients','Seasonal Light And Abstract Colour','Investing In Emerging Australian Artists','How To Acquire A Sold-Out Series Work','Scale, Negative Space And Impact','A Collector’s Guide To Contemporary Abstraction'
];
const audiences = ['collectors','interior designers','architects','luxury homeowners','art consultants'];
const blog = blogTitles.slice(0, N_BLOG).map((t, i) => {
  const slug = slugify(t);
  const aud = audiences[i % audiences.length];
  const coll = collections[i % collections.length];
  return {
    id: `post-${String(i + 1).padStart(3, '0')}`,
    slug, title: t,
    audience: aud,
    publishedAt: `2025-${String((i % 12) + 1).padStart(2,'0')}-${String((i % 27) + 1).padStart(2,'0')}`,
    readMinutes: 5 + (i % 6),
    excerpt: `A practical guide for ${aud} on ${t.toLowerCase()}, from Sydney contemporary artist Ritushka.`,
    seoTitle: `${t} | Ritushka Art Journal`,
    metaDescription: `${t}. Expert guidance for ${aud} from Ritushka, a contemporary abstract landscape and seascape artist in Sydney. Practical, authoritative and image-led.`,
    relatedCollection: slugify(coll.name),
    image: `/blog/${slug}.jpg`,
    body: `## ${t}\n\nThis guide is written for ${aud} who want a clear, confident answer. Ritushka creates large-scale abstract ${coll.name.toLowerCase()} from a Lane Cove, Sydney studio, and works directly with ${aud} worldwide.\n\n### Key takeaways\n\n- Match scale to the wall, not the furniture.\n- Lead with palette and light before subject.\n- Buy original work where provenance and longevity matter.\n\n### Working with Ritushka\n\nEvery original ships worldwide with a certificate of authenticity. Commissions are welcomed for bespoke size and palette.`,
  };
});

const banner = '// AUTO-GENERATED by scripts/generate-data.mjs — edit the generator or override per-record, do not hand-edit blindly.\n';
const w = (file, name, type, data) =>
  writeFileSync(`src/data/${file}`, `${banner}import type { ${type} } from './types';\nexport const ${name}: ${type}[] = ${JSON.stringify(data, null, 2)};\n`);

const collectionRecords = collections.map((c, i) => ({
  id: 'col-' + String(i + 1).padStart(2, '0'),
  slug: slugify(c.name), name: c.name, keyword: c.keyword, intent: c.intent,
  heading: c.name + ' by Ritushka',
  seoTitle: c.name + ' | Original Paintings by Ritushka, Sydney',
  metaDescription: 'Explore ' + c.name.toLowerCase() + ' by Ritushka — original ' + c.keyword + ' for ' + c.intent + '. Sydney-based contemporary artist shipping worldwide. Available works and commissions.',
  intro: "This collection brings together Ritushka's " + c.name.toLowerCase() + ' — original ' + c.keyword + ' created for ' + c.intent + '. Each work is painted in layers from a Lane Cove, Sydney studio and ships worldwide with a certificate of authenticity.',
  faqs: [
    { q: 'What sizes do ' + c.name.toLowerCase() + ' come in?', a: 'Works range from intimate pieces to large-scale statement paintings over two metres. Custom sizes are available by commission.' },
    { q: 'Can I commission a ' + c.name.toLowerCase() + ' in a specific palette?', a: 'Yes. Ritushka accepts commissions and will work to your size, palette and space. Allow 4-8 weeks plus shipping.' },
    { q: 'Do you ship ' + c.name.toLowerCase() + ' internationally?', a: 'Yes — all originals ship worldwide, fully insured, with tracking and a certificate of authenticity.' },
  ],
}));
w('collections.ts', 'collections', 'Collection', collectionRecords);

w('artworks.ts','artworks','Artwork',artworks);
w('mockups.ts','mockups','Mockup',mockups);
w('blog.ts','blog','BlogPost',blog);

console.log(`Generated: ${collections.length} collections, ${artworks.length} artworks, ${mockups.length} mockups, ${blog.length} posts`);
