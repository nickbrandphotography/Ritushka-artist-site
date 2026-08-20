import Link from 'next/link';
import Container from './Container';
import MobileNav from './MobileNav';
import { site } from '@/site.config';

const nav = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/collections', label: 'Collections' },
  { href: '/available', label: 'Available' },
  { href: '/commission', label: 'Commission' },
  { href: '/trade', label: 'Trade' },
  { href: '/blog', label: 'Journal' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand/70 bg-bone/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-xl tracking-wide text-ink">{site.artist.name}</Link>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm text-ink/80">
            {nav.map(n => <li key={n.href}><Link href={n.href} className="hover:text-ink">{n.label}</Link></li>)}
          </ul>
        </nav>
        <MobileNav items={nav} />
      </Container>
    </header>
  );
}
