import Link from 'next/link';
import Container from './Container';
export default function CtaBand({ title, body, primary, secondary }: {
  title: string; body: string;
  primary: { href: string; label: string }; secondary?: { href: string; label: string };
}) {
  return (
    <section className="my-20 border-y border-sand bg-sand/40 py-14">
      <Container className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="font-serif text-3xl text-ink">{title}</h2>
          <p className="mt-2 text-ink/70">{body}</p>
        </div>
        <div className="flex gap-3">
          <Link href={primary.href} className="rounded-full bg-ink px-6 py-3 text-sm text-bone">{primary.label}</Link>
          {secondary && <Link href={secondary.href} className="rounded-full border border-ink px-6 py-3 text-sm">{secondary.label}</Link>}
        </div>
      </Container>
    </section>
  );
}
