import ProgramPage from '@/components/ProgramPage';
import { programs } from '@/data/programs';
import { buildMetadata } from '@/lib/seo';
const p = programs['corporate'];
export const metadata = buildMetadata({ title: p.seoTitle, description: p.metaDescription, path: '/trade/corporate' });
export default function Page() { return <ProgramPage p={p} />; }
