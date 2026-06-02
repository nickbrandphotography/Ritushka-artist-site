import Prose from '@/components/Prose';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({ title: 'Artwork Installation Guide', description: 'How to hang, light and care for a large-scale original painting. A practical installation guide from Ritushka for collectors, designers and homeowners.', path: '/installation-guide' });
export default function Page() {
  return (
    <Prose title="Artwork installation guide" intro="How to hang, light and care for your original painting." crumbs={[{ name: 'Home', path: '/' }, { name: 'Installation Guide', path: '/installation-guide' }]}>
      <h2>Hanging height</h2>
      <p>Centre the work at approximately 145–150cm from the floor to the painting's midpoint. Above a sofa or console, leave 15–25cm between the furniture top and the frame.</p>
      <h2>Fixings</h2>
      <p>Use fixings rated well above the work's weight and anchor into studs or use appropriate masonry/plasterboard anchors. Large works should use two points for stability and levelling.</p>
      <h2>Lighting</h2>
      <p>Light from above at a 30-degree angle with adjustable LED picture lights or track lighting. Avoid direct sunlight, which can fade pigments over time.</p>
      <h2>Care</h2>
      <p>Dust gently with a soft, dry cloth. Avoid solvents and water. Keep away from heat sources and high humidity.</p>
    </Prose>
  );
}
