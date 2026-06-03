import fs from 'node:fs';
const file = 'src/data/blog.ts';
const src = fs.readFileSync(file, 'utf8');
const k = src.indexOf('= ['); const arr = JSON.parse(src.slice(k + 2, src.lastIndexOf(']') + 1));

const collName = {
  'abstract-landscapes': 'Abstract Landscapes', 'abstract-seascapes': 'Abstract Seascapes',
  'large-scale-paintings': 'Large Scale Paintings', 'coastal-abstract-art': 'Coastal Abstract Art',
  'ocean-inspired-paintings': 'Ocean Inspired Paintings', 'contemporary-landscape-art': 'Contemporary Landscape Art',
  'textured-abstract-paintings': 'Textured Abstract Paintings', 'blue-abstract-paintings': 'Blue Abstract Paintings',
  'modern-australian-art': 'Modern Australian Art', 'statement-artworks': 'Statement Artworks',
};

const seedof = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = seed => () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
const pickN = (rnd, pool, n) => { const a = [...pool]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
const one = (rnd, pool) => pool[Math.floor(rnd() * pool.length)];

// Large pool of distinct, genuinely useful takeaways
const TAKEAWAYS = [
  'Measure the wall, then choose a work that fills roughly two-thirds to three-quarters of its width.',
  'Hang the centre of the piece at eye level — about 145–150cm from the floor.',
  'Let the dominant colour in the painting echo, not match, an existing accent in the room.',
  'In open-plan spaces, scale up: a small work on a large wall reads as an afterthought.',
  'Buy the work that holds your attention across the room, not just up close.',
  'Originals carry provenance, texture and resale value that prints cannot replicate.',
  'Natural light changes a painting through the day — view it morning and evening before deciding.',
  'Leave breathing room; negative wall space around a work is part of the composition.',
  'Trust palette and mood over literal subject matter when the style is abstract.',
  'A single large statement piece almost always beats a cluster of small ones on a feature wall.',
  'Texture reads from a distance — impasto and layered surfaces add depth a flat print loses.',
  'Commissioning lets you fix the exact size, palette and orientation your space needs.',
  'Frame floating or leave deep-edge canvases unframed for a clean, contemporary finish.',
  'Account for furniture height: leave 15–25cm between a sofa top and the base of the work.',
  'Document condition and certificate of authenticity on delivery for insurance and resale.',
  'Cooler blues recede and calm a room; warmer ochres advance and energise it.',
  'For coastal interiors, choose works whose horizon and light reference the local landscape.',
  'Plan lighting early — an adjustable picture light transforms how a painting reads at night.',
  'Order large works well ahead; crating and freight add time to the delivery window.',
  'A cohesive collection shares a thread — palette, scale or subject — rather than matching exactly.',
];

const INTRO = [
  (t, a, c) => `${t} comes up constantly with ${a}, and the honest answer is simpler than most expect. Drawing on years of creating ${c} from a Lane Cove, Sydney studio, here is how Ritushka approaches it.`,
  (t, a, c) => `If you are weighing up ${t.toLowerCase().replace(/[?:.]/g,'')}, this guide cuts through the noise. It is written for ${a} and grounded in the practice behind Ritushka's ${c}.`,
  (t, a, c) => `Few decisions shape a room as much as the art on its walls. For ${a} asking about ${t.toLowerCase().replace(/[?:.]/g,'')}, here is a clear, practical view from the studio.`,
  (t, a, c) => `This is a question Ritushka fields often from ${a}. The short version follows, with the reasoning a working artist uses when creating ${c}.`,
];

const SECTION_HEADS = [
  ['What to consider first', 'Getting the scale right', 'Where most people go wrong', 'The practical checklist'],
  ['Why it matters', 'How the studio approaches it', 'A note on materials and longevity', 'Working with an artist directly'],
];

const SECTION_BODY = {
  scale: 'Scale is the decision people most often get wrong. A work that looks generous in a gallery can shrink against a tall, open wall at home, so always measure the space and size up rather than down. As a rule, the piece should command its wall without crowding the architecture around it.',
  coastal: 'For coastal and light-filled homes, the most resolved choices reference the landscape they live in — horizon lines, sea light, weathered tones. The work does not need to depict the coast literally; an abstract field of the right blues and greys will hold the feeling of the place far longer than a literal scene.',
  commission: 'A commission removes the compromise. Rather than searching for a work that almost fits, you specify the exact dimensions, palette and orientation, and receive progress images as it develops. The process runs over four to eight weeks and ends with insured delivery and a certificate of authenticity.',
  invest: 'Original art holds value in a way reproductions cannot. Provenance, the artist\'s trajectory, and the simple scarcity of a one-off work all matter at resale. Keep your certificate of authenticity and condition records, and buy what genuinely moves you — conviction tends to age well.',
  designer: 'For trade clients, the workflow matters as much as the work. Reliable lead times, high-resolution imagery and in-situ mockups for client presentations, and clear trade pricing turn a single placement into a repeatable part of your sourcing process.',
  light: 'Light is the quiet variable. The same painting reads differently at 9am and 9pm, and a well-aimed picture light at roughly thirty degrees keeps it alive after dark. View any work in the actual room, in the actual light, before committing.',
  default: 'The underlying principle is restraint and intention: choose fewer, better works, give them room to breathe, and let palette and light do the work. A considered original will outlast trends and reward years of looking.',
};

function bodyFor(p) {
  const rnd = rng(seedof(p.slug));
  const c = collName[p.relatedCollection] || 'contemporary abstract paintings';
  const cLower = c.toLowerCase();
  const t = p.title;
  const tl = t.toLowerCase();
  const intro = one(rnd, INTRO)(t, p.audience, cLower);
  const takeaways = pickN(rnd, TAKEAWAYS, 4).map(x => `- ${x}`).join('\n');
  const heads = SECTION_HEADS.map(h => one(rnd, h));
  // pick two topical bodies by keyword, distinct
  const keys = [];
  if (/coast|ocean|sea|blue/.test(tl)) keys.push('coastal');
  if (/commission/.test(tl)) keys.push('commission');
  if (/invest|value|price|worth/.test(tl)) keys.push('invest');
  if (/designer|consult|architect|developer|agent|source/.test(tl)) keys.push('designer');
  if (/light|hang|place|wall|frame|care|photograph|size|scale/.test(tl)) keys.push('light', 'scale');
  while (keys.length < 2) keys.push('default');
  const s1 = SECTION_BODY[keys[0]];
  let s2k = keys.find(k => k !== keys[0]) || 'default';
  const s2 = SECTION_BODY[s2k];

  return [
    `## ${t}`,
    intro,
    `### ${heads[0]}`,
    s1,
    `### Key takeaways`,
    takeaways,
    `### ${heads[1]}`,
    s2,
    `### Working with Ritushka`,
    `Ritushka creates ${cLower} from a studio in Lane Cove, Sydney, working directly with ${p.audience} across Australia and worldwide. Every original is signed, ships fully insured with a certificate of authenticity, and commissions are welcomed for bespoke size, palette and scale. Explore the related ${c} collection or start a commission to take the next step.`,
  ].join('\n\n');
}

for (const p of arr) p.body = bodyFor(p);

const banner = '// AUTO-GENERATED by scripts/generate-data.mjs — edit the generator or override per-record, do not hand-edit blindly.\n';
fs.writeFileSync(file, `${banner}import type { BlogPost } from './types';\nexport const blog: BlogPost[] = ${JSON.stringify(arr, null, 2)};\n`);
console.log('Rewrote bodies for', arr.length, 'posts');
