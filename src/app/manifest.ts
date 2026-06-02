import type { MetadataRoute } from 'next';
import { site } from '@/site.config';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.brand.name, short_name: site.artist.name, description: site.artist.shortBio,
    start_url: '/', display: 'standalone', background_color: '#f6f4ef', theme_color: '#1a1a18',
    icons: [{ src: '/icon.png', sizes: '512x512', type: 'image/png' }],
  };
}
