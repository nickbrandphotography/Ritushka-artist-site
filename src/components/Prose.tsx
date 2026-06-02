import Container from './Container';
import Breadcrumbs from './Breadcrumbs';
export default function Prose({ title, intro, crumbs, children }: {
  title: string; intro?: string; crumbs: { name: string; path: string }[]; children?: React.ReactNode;
}) {
  return (
    <Container className="py-14">
      <Breadcrumbs crumbs={crumbs} />
      <h1 className="mt-5 max-w-3xl font-serif text-4xl text-ink md:text-5xl">{title}</h1>
      {intro && <p className="mt-4 max-w-2xl text-lg text-ink/75">{intro}</p>}
      <div className="prose-art mt-8 max-w-2xl">{children}</div>
    </Container>
  );
}
