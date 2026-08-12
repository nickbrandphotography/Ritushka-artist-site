// ⚠️  SUPERSEDED — do not run. This was the first-pass generator, written before the
// Artwork Register was filled in. Running it now would wipe the real dimensions,
// descriptions and sold statuses. Use scripts/sync-register.py instead; it reads
// "Artwork Records.ods" and updates the data in place.
//
// Kept only as the record of the curated palette / collection / subject copy that
// sync-register.py preserves.
//
// Builds artworks.ts, collections.ts and mockups.ts from the REAL artwork files.
import fs from 'node:fs';

const man = JSON.parse(fs.readFileSync('/tmp/artmanifest.json', 'utf8'));

// title, collections, palette words, short subject line — from visual review of each work
const META = {
  'approaching-destination': ['Approaching Destination', ['abstract-seascapes','ocean-inspired-paintings','blue-abstract-paintings'], 'deep teal, seafoam and warm sand', 'a swelling body of water breaking toward the shore'],
  'aqua-frost-thinking-of-you': ['Aqua Frost — Thinking of You', ['abstract-seascapes','ocean-inspired-paintings','blue-abstract-paintings'], 'frosted aqua, silver and pale blue', 'light scattering across a still, shallow surface'],
  'blue-mountains': ['Blue Mountains', ['abstract-landscapes','contemporary-landscape-art','modern-australian-art','textured-abstract-paintings'], 'stone grey, mist blue and chalk white', 'ranges dissolving into cloud and distance'],
  'bush': ['Bush', ['other-works','modern-australian-art'], 'white and silver on deep black', 'native foliage drawn in white against darkness'],
  'coastal-waters': ['Coastal Waters', ['abstract-seascapes','coastal-abstract-art','ocean-inspired-paintings','blue-abstract-paintings'], 'turquoise, jade and foam white', 'the turning weight of a wave close to shore'],
  'deliciousness': ['Deliciousness', ['statement-artworks','textured-abstract-paintings'], 'blush pink, coral and cream', 'a soft bloom of warmth and light'],
  'desire': ['Desire', ['abstract-seascapes','ocean-inspired-paintings','blue-abstract-paintings','large-scale-paintings'], 'deep ocean blue, teal and breaking white', 'a wave at the moment it begins to fold'],
  'erruption': ['Erruption', ['abstract-landscapes','coastal-abstract-art','contemporary-landscape-art'], 'rust, cloud white and lagoon blue', 'a headland meeting bright shallow water'],
  'go-with-the-flow': ['Go With the Flow', ['other-works'], 'turquoise with jewelled brights', 'a shoal of fish moving together as one'],
  'horizon': ['Horizon', ['abstract-landscapes','contemporary-landscape-art','large-scale-paintings'], 'warm grey, taupe and soft gold', 'a long, quiet horizon held in haze'],
  'into-the-ever-blue': ['Into the Ever Blue', ['abstract-seascapes','ocean-inspired-paintings','blue-abstract-paintings'], 'turquoise, ice white and slate', 'the pull of open water beyond the break'],
  'just-add-champagne': ['Just Add Champagne', ['statement-artworks'], 'rose, blush and pale gold', 'effervescence caught mid-rise'],
  'life-chooses-you': ['Life Chooses You', ['textured-abstract-paintings','contemporary-landscape-art'], 'cream, umber and weathered white', 'a worked surface of drift and sediment'],
  'mashmellow': ['Mashmellow', ['statement-artworks','textured-abstract-paintings'], 'butter cream, sand and pale rose', 'warmth settling into softness'],
  'numero-uno': ['Numero Uno', ['other-works'], 'white and pearl on black', 'repeated forms in ordered rhythm'],
  'one-of-a-kind': ['One of a Kind', ['abstract-seascapes','ocean-inspired-paintings','coastal-abstract-art'], 'deep teal, ink blue and mast white', 'sails held on dark, glassy water'],
  'paragliding': ['Paragliding', ['textured-abstract-paintings','contemporary-landscape-art'], 'earth brown, teal and bone', 'the ground seen from a lifting height'],
  'peony-thinking-of-me': ['Peony — Thinking of Me', ['statement-artworks'], 'cream, blush and soft apricot', 'a petal-light field of warmth'],
  'piece-of-white-heavan': ['Piece of White Heaven', ['abstract-landscapes','abstract-seascapes','blue-abstract-paintings'], 'sky blue, cloud white and aqua', 'clouds breaking over open water'],
  'plateau': ['Plateau', ['abstract-landscapes','contemporary-landscape-art','large-scale-paintings'], 'bone, oyster and pale sand', 'a wide, still expanse under flat light'],
  'reflection': ['Reflection', ['other-works','blue-abstract-paintings'], 'cobalt, ultramarine and white', 'light scattered in circles across deep blue'],
  'river-of-my-thoughts': ['River of My Thoughts', ['textured-abstract-paintings','contemporary-landscape-art'], 'pearl, russet and soft grey', 'a current of drifting, layered marks'],
  'rushing-shallows': ['Rushing Shallows', ['coastal-abstract-art','abstract-seascapes','ocean-inspired-paintings'], 'bone white, stone and pale aqua', 'water racing over rock and sand'],
  'set-sail': ['Set Sail', ['abstract-seascapes','ocean-inspired-paintings','blue-abstract-paintings'], 'deep sea blue, teal and white', 'sails against a darkening harbour'],
  'shoreham': ['Shoreham', ['coastal-abstract-art','abstract-landscapes','modern-australian-art'], 'sky blue, cloud white and warm dune', 'a dune rising under a wide coastal sky'],
  'soft-awakening': ['Soft Awakening', ['abstract-seascapes','statement-artworks'], 'pale aqua, mist and cream', 'first light spreading across still water'],
  'softly-loving-dreamscape': ['Softly Loving Dreamscape', ['ocean-inspired-paintings','blue-abstract-paintings','abstract-seascapes','large-scale-paintings'], 'turquoise, deep teal and foam', 'looking down through clear, moving water'],
  'stillness': ['Stillness', ['abstract-seascapes','ocean-inspired-paintings','blue-abstract-paintings'], 'cobalt, aqua and warm sand', 'banded sea and sky at rest'],
  'strangely-attracted-to-you': ['Strangely Attracted to You', ['statement-artworks','textured-abstract-paintings','large-scale-paintings'], 'rose, crimson and cream', 'a charged field of colour and mark'],
  'sunrise-over-tokyo': ['Sunrise Over Tokyo', ['statement-artworks','contemporary-landscape-art'], 'coral, flame orange and rose', 'a city sky at the moment of sunrise'],
  'the-apostles': ['The Apostles', ['coastal-abstract-art','abstract-landscapes','modern-australian-art'], 'sea green, storm grey and ochre stone', 'sea stacks standing in restless water'],
  'the-world-in-my-eyes': ['The World In My Eyes', ['other-works'], 'saturated blue, red and gold', 'a figure rendered in bold graphic colour'],
  'the-world-in-my-eyes-2': ['The World In My Eyes II', ['other-works'], 'saturated orange, blue and teal', 'an eye opening into pattern and colour'],
  'tree-of-our-life': ['Tree of Our Life', ['other-works'], 'turquoise, blush and jewelled brights', 'a tree alive with birds, flowers and detail'],
  'turbulence': ['Turbulence', ['abstract-seascapes','abstract-landscapes','blue-abstract-paintings'], 'pale blue, cloud white and aqua', 'weather gathering over open water'],
  'turquoise-tuesday': ['Turquoise Tuesday', ['abstract-seascapes','coastal-abstract-art','ocean-inspired-paintings','blue-abstract-paintings'], 'turquoise, surf white and soft sky', 'a bright day of moving surf'],
  'urban-jungle': ['Urban Jungle', ['textured-abstract-paintings','other-works'], 'pale grey, aqua and silver', 'pattern emerging through a worked surface'],
  'without-sweet-harmony': ['Without Sweet Harmony', ['statement-artworks'], 'flame orange, crimson and rose', 'heat and movement in full colour'],
  'without-sweet-harmony-2': ['Without Sweet Harmony II', ['statement-artworks'], 'scarlet, orange and deep rose', 'a second movement in fire and rose'],
  'wave': ['Wave', ['abstract-seascapes','ocean-inspired-paintings','blue-abstract-paintings'], 'turquoise, deep blue and foam white', 'the curl and break of a single wave'],
};

const COLLECTIONS = [
  ['abstract-landscapes','Abstract Landscapes','abstract landscape art','collectors seeking contemporary abstract landscape paintings'],
  ['abstract-seascapes','Abstract Seascapes','abstract seascape paintings','buyers of coastal and ocean abstract art'],
  ['large-scale-paintings','Large Scale Paintings','large scale art','designers and architects sourcing expansive statement works'],
  ['coastal-abstract-art','Coastal Abstract Art','coastal abstract art','luxury coastal homes'],
  ['ocean-inspired-paintings','Ocean Inspired Paintings','ocean inspired paintings','collectors drawn to the sea'],
  ['contemporary-landscape-art','Contemporary Landscape Art','contemporary landscape art','modern interiors'],
  ['textured-abstract-paintings','Textured Abstract Paintings','textured abstract paintings','collectors who value materiality and surface'],
  ['blue-abstract-paintings','Blue Abstract Paintings','blue abstract paintings','colour-led buyers'],
  ['modern-australian-art','Modern Australian Art','modern australian art','buyers seeking Australian provenance'],
  ['statement-artworks','Statement Artworks','statement artwork','corporate and luxury commissions'],
  ['other-works','Other Works','original figurative and decorative art','collectors looking beyond landscape'],
];
const cName = Object.fromEntries(COLLECTIONS.map(c => [c[0], c[1]]));

const artworks = [];
for (const r of man) {
  const slug = r.slug === 's4a9095' ? 'wave' : r.slug;
  const m = META[slug];
  if (!m) { console.warn('NO META for', slug); continue; }
  const [title, colls, palette, subject] = m;
  const primary = colls[0];
  const primaryName = cName[primary];
  const story = `${title} is an original painting by Ritushka — ${subject}, worked in ${palette}. Built in layers from her Lane Cove studio in Sydney, the surface is developed and reworked so that light seems to shift across it as you move. Dimensions, medium and price for this work are available on request.`;
  artworks.push({
    id: 'aw-' + String(artworks.length + 1).padStart(3, '0'),
    slug, title,
    year: null, medium: '',
    widthCm: null, heightCm: null,
    imageWidth: r.w, imageHeight: r.h,
    palette,
    collections: colls, primaryCollection: primary,
    status: 'enquire', price: null, currency: 'AUD',
    orientation: r.orientation,
    story,
    shortDescription: `${title} — an original ${primaryName.toLowerCase()} painting by Sydney artist Ritushka. Enquire for dimensions, medium and price.`,
    seoTitle: `${title} | Original Painting by Ritushka`,
    metaDescription: `${title}, an original ${primaryName.toLowerCase()} painting by Ritushka, contemporary artist in Lane Cove, Sydney. ${subject[0].toUpperCase() + subject.slice(1)}. Enquire for size, medium and price. Ships worldwide.`,
    image: `/artworks/${slug}.jpg`,
    alt: `${title} — original ${primaryName.toLowerCase()} painting by Ritushka in ${palette}`,
    mockups: [],
  });
}

// ---- mockups: one in-situ per artwork
const ROOMS = ['Living Room','Luxury Home','Coastal Home','Modern Apartment','Architectural Interior','Commercial Space','Designer Space','Penthouse','Hotel Lobby','Boardroom'];
const mockups = [];
artworks.forEach((a, i) => {
  const room = ROOMS[i % ROOMS.length];
  const slug = `${a.slug}-in-${room.toLowerCase().replace(/\s+/g,'-')}`;
  mockups.push({
    id: 'mk-' + String(i + 1).padStart(3, '0'),
    slug, room, artworkSlug: a.slug,
    title: `${a.title} in a ${room}`,
    image: `/mockups/${slug}.jpg`,
    alt: `${a.title} by Ritushka displayed in a ${room.toLowerCase()} — ${a.palette}`,
    seoTitle: `${a.title} Styled in a ${room} | Ritushka`,
    metaDescription: `See ${a.title} by Ritushka styled in a ${room.toLowerCase()}. Scale, palette and placement reference for collectors and interior designers. Enquire to acquire or commission.`,
  });
  a.mockups.push(slug);
});

// ---- collections (no invented size claims)
const collections = COLLECTIONS.map(([slug, name, keyword, intent], i) => {
  const count = artworks.filter(a => a.collections.includes(slug)).length;
  return {
    id: 'col-' + String(i + 1).padStart(2, '0'),
    slug, name, keyword, intent,
    heading: `${name} by Ritushka`,
    seoTitle: `${name} | Original Paintings by Ritushka, Sydney`,
    metaDescription: `Explore ${name.toLowerCase()} by Ritushka — original ${keyword} for ${intent}. Contemporary artist in Lane Cove, Sydney, shipping worldwide. Enquire about available works and commissions.`,
    intro: `This collection brings together Ritushka's ${name.toLowerCase()} — original ${keyword} created for ${intent}. Each work is painted in layers from a Lane Cove, Sydney studio and ships worldwide with a certificate of authenticity. Dimensions, medium and price for any work are available on request.`,
    faqs: [
      { q: `What sizes do these ${name.toLowerCase()} come in?`, a: `Sizes vary across the collection, from intimate works to expansive statement pieces. Exact dimensions for any painting are available on request — just enquire and Ritushka's studio will send full details.` },
      { q: `How much do ${name.toLowerCase()} cost?`, a: `Price is provided on application and depends on the size and complexity of the work. Enquire about any piece and you will receive current pricing, availability and shipping options.` },
      { q: `Can I commission a work in this style?`, a: `Yes. Ritushka accepts commissions and will work to your size, palette and space. Allow 4-8 weeks of studio time plus shipping.` },
      { q: `Do you ship internationally?`, a: `Yes — all originals ship worldwide, fully insured, with tracking and a certificate of authenticity.` },
    ],
    _count: count,
  };
});
collections.forEach(c => { if (!c._count) console.warn('EMPTY COLLECTION:', c.slug); delete c._count; });

const banner = '// AUTO-GENERATED by scripts/build-real-artworks.mjs from the real Artwork folder.\n';
const w = (file, name, type, data) =>
  fs.writeFileSync(`src/data/${file}`, `${banner}import type { ${type} } from './types';\nexport const ${name}: ${type}[] = ${JSON.stringify(data, null, 2)};\n`);
w('artworks.ts','artworks','Artwork',artworks);
w('mockups.ts','mockups','Mockup',mockups);
w('collections.ts','collections','Collection',collections);

console.log(`artworks ${artworks.length}, mockups ${mockups.length}, collections ${collections.length}`);
for (const c of collections) console.log('  ', c.slug, artworks.filter(a=>a.collections.includes(c.slug)).length);
