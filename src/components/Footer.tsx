import Link from 'next/link';
import Image from 'next/image';
import Container from './Container';
import EmailCapture from './EmailCapture';
import { site } from '@/site.config';
import { collections } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-sand bg-ink text-bone">
      <Container className="grid gap-10 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-serif text-2xl">{site.artist.name}</p>
          <p className="mt-3 text-sm text-bone/70">{site.artist.tagline}. {site.location.suburb}, {site.location.city}.</p>
          <Image
            src="/qr-code.png"
            alt={`Scan to visit ${site.brand.name}`}
            width={1024}
            height={1024}
            sizes="80px"
            className="mt-6 h-20 w-20 opacity-80 transition-opacity hover:opacity-100"
          />
        </div>
        <nav aria-label="Collections">
          <h2 className="text-xs uppercase tracking-widest text-bone/50">Collections</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-bone/80">
            {collections.slice(0, 6).map(c => <li key={c.slug}><Link href={`/collections/${c.slug}`} className="hover:text-bone">{c.name}</Link></li>)}
            <li><Link href="/collections" className="underline">All collections</Link></li>
          </ul>
        </nav>
        <nav aria-label="For trade">
          <h2 className="text-xs uppercase tracking-widest text-bone/50">For Trade</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-bone/80">
            <li><Link href="/trade/interior-designers" className="hover:text-bone">Interior Designers</Link></li>
            <li><Link href="/trade/art-consultants" className="hover:text-bone">Art Consultants</Link></li>
            <li><Link href="/trade/buyers-agents" className="hover:text-bone">Buyer&rsquo;s Agents</Link></li>
            <li><Link href="/trade/corporate" className="hover:text-bone">Corporate Art</Link></li>
            <li><Link href="/commission" className="hover:text-bone">Commissions</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="text-xs uppercase tracking-widest text-bone/50">Collector List</h2>
          <p className="mt-3 text-sm text-bone/70">New works and private viewings, first.</p>
          <div className="mt-3"><EmailCapture dark /></div>
        </div>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-bone/15 py-6 text-xs text-bone/50 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {site.brand.name}. All rights reserved.</p>
        <nav aria-label="More"><ul className="flex flex-wrap gap-4">
          <li><Link href="/portfolio" className="hover:text-bone">Portfolio</Link></li>
          <li><Link href="/sold" className="hover:text-bone">Sold Works</Link></li>
          <li><Link href="/shipping" className="hover:text-bone">Shipping</Link></li>
          <li><Link href="/faq" className="hover:text-bone">FAQ</Link></li>
          <li><Link href="/privacy" className="hover:text-bone">Privacy</Link></li>
          <li><Link href="/terms" className="hover:text-bone">Terms</Link></li>
        </ul></nav>
      </Container>
    </footer>
  );
}
