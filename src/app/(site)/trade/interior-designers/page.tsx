import ProgramPage from '@/components/ProgramPage';
import { programs } from '@/data/programs';
import { buildMetadata } from '@/lib/seo';
const p = programs['interior-designers'];
export const metadata = buildMetadata({ title: p.seoTitle, description: p.metaDescription, path: '/trade/interior-designers' });
export default function Page() { return <ProgramPage p={p} />; }
