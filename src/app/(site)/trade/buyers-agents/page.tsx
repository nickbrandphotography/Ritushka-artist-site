import ProgramPage from '@/components/ProgramPage';
import { programs } from '@/data/programs';
import { buildMetadata } from '@/lib/seo';
const p = programs['buyers-agents'];
export const metadata = buildMetadata({ title: p.seoTitle, description: p.metaDescription, path: '/trade/buyers-agents' });
export default function Page() { return <ProgramPage p={p} />; }
