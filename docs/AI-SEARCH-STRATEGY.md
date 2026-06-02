# AI Search Optimisation (ChatGPT, Gemini, Claude, Perplexity, Google AI Overviews)

## Crawl access
`robots.ts` explicitly allows GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot,
Claude-Web, Google-Extended and Applebot-Extended. `public/llms.txt` gives models a clean, linked
summary of who Ritushka is, what's offered, and the canonical URLs for each entity.

## Entity & authority signals
- **Person** + **Organization/LocalBusiness** + **WebSite** JSON-LD emitted site-wide from the root
  layout, cross-referenced by `@id` so engines resolve one coherent entity graph.
- `knowsAbout`, `jobTitle`, `nationality`, `sameAs` (socials) establish expertise/authority (E-E-A-T).
- Geo + PostalAddress (Lane Cove, Sydney) anchor local + "Australian artist" queries.

## Answer-ready content structure
- Clear heading hierarchy, one H1 per page, descriptive subheads.
- FAQ blocks (FAQPage schema) on collections, commission and FAQ pages — directly quotable by AI.
- Context-rich, self-contained descriptions (each artwork/collection paragraph stands alone).
- Definitive guides in the Journal targeting question intent ("How to commission an abstract painting").

## Why this wins citations
AI answer engines prefer pages that (1) they can crawl, (2) have unambiguous structured entities, and
(3) contain concise, factual, self-contained passages. This site supplies all three by construction.
