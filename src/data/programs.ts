import type { FAQ } from './types';
export interface Program {
  slug: string; audience: string; title: string; seoTitle: string; metaDescription: string;
  intro: string; benefits: string[]; faqs: FAQ[];
}
export const programs: Record<string, Program> = {
  'interior-designers': {
    slug: 'interior-designers', audience: 'Interior Designers',
    title: 'Interior Designer Program',
    seoTitle: 'Art for Interior Designers | Trade Program',
    metaDescription: 'Original abstract art for interior designers. Trade pricing, reserved previews, custom sizing, hi-res imagery and white-glove delivery from Sydney artist Ritushka.',
    intro: 'A dedicated program for interior designers sourcing original art for residential and hospitality projects — trade pricing, bespoke sizing and reliable lead times.',
    benefits: ['Trade pricing on originals and commissions', 'Reserved previews before public release', 'Custom sizes and palettes to match your scheme', 'High-resolution imagery and in-situ mockups for client presentations', 'White-glove, insured worldwide delivery', 'Net payment terms for established studios'],
    faqs: [
      { q: 'Do you offer trade discounts?', a: 'Yes — registered designers receive trade pricing on originals and commissions.' },
      { q: 'Can I get mockups for client presentations?', a: 'Yes. In-situ visualisations and hi-res files are provided to support your pitch.' },
      { q: 'What are typical lead times?', a: 'Available works ship within days; commissions run 4–8 weeks plus delivery.' },
    ],
  },
  'art-consultants': {
    slug: 'art-consultants', audience: 'Art Consultants',
    title: 'Art Consultant Program',
    seoTitle: 'Art Consultant Services | Trade Program',
    metaDescription: 'Partner with Sydney artist Ritushka as an art consultant. Trade terms, curated selections, commissions at scale and documentation for collectors and corporate clients.',
    intro: 'Built for art consultants placing work with private collectors, corporate and hospitality clients — curated selections, commissions at scale and full documentation.',
    benefits: ['Consultant trade terms and commissions', 'Curated selections for client briefs', 'Series and multi-work commissions', 'Provenance documentation and certificates', 'Priority access to new bodies of work'],
    faqs: [
      { q: 'Can you produce a cohesive series?', a: 'Yes — multi-work and series commissions are a core part of the studio practice.' },
      { q: 'Is documentation provided?', a: 'Every work ships with a certificate of authenticity and provenance details.' },
    ],
  },
  'buyers-agents': {
    slug: 'buyers-agents', audience: "Buyer's Agents",
    title: "Buyer's Agent Program",
    seoTitle: "Art for Buyer's Agents & Property Styling",
    metaDescription: "Original statement art for buyer's agents and property stylists. Elevate luxury listings and display suites with large-scale abstract paintings. Trade terms available.",
    intro: "For buyer's agents and property stylists elevating luxury listings and display suites with original statement art that helps homes sell.",
    benefits: ['Statement works that elevate luxury listings', 'Flexible loan and purchase options for styling', 'Fast turnaround on available works', 'Large-scale pieces for double-height and feature walls'],
    faqs: [
      { q: 'Can art be used for styling a listing?', a: 'Yes — flexible loan and purchase arrangements are available for staging and display suites.' },
      { q: 'How quickly can you deliver?', a: 'Available works can be delivered within days across Sydney and shipped nationally.' },
    ],
  },
  'corporate': {
    slug: 'corporate', audience: 'Corporate Art Buyers',
    title: 'Corporate Art Services',
    seoTitle: 'Corporate Art Services & Commissions',
    metaDescription: 'Corporate art services from Sydney artist Ritushka — large-scale commissions for lobbies, offices, hotels and developments. Project management and worldwide installation.',
    intro: 'Large-scale commissions and curated placements for corporate lobbies, offices, hotels and property developments — managed end to end.',
    benefits: ['Large-scale and multi-work commissions', 'Project management from brief to install', 'Tax-invoiced procurement for businesses', 'Worldwide crating, shipping and installation', 'Brand-aligned palettes and scale'],
    faqs: [
      { q: 'Do you handle installation?', a: 'Yes — crating, freight and professional installation can be coordinated worldwide.' },
      { q: 'Can you invoice a company?', a: 'Yes, full tax invoicing and procurement documentation are provided.' },
    ],
  },
};
