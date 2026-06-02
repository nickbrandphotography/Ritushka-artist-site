import Link from 'next/link';
import Container from '@/components/Container';
export default function NotFound() {
  return (
    <Container className="py-32 text-center">
      <h1 className="font-serif text-5xl text-ink">Page not found</h1>
      <p className="mt-4 text-ink/65">The page you're looking for may have sold or moved.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/available" className="rounded-full bg-ink px-6 py-3 text-sm text-bone">View available works</Link>
        <Link href="/" className="rounded-full border border-ink px-6 py-3 text-sm">Home</Link>
      </div>
    </Container>
  );
}
