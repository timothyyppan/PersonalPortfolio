import type { MetadataRoute } from 'next';
import { COLLECTION_KEYS } from '@/lib/collections';
import { getEntries } from '@/lib/content';

const BASE_URL = 'https://timothypan.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [''].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));

  const entryRoutes = COLLECTION_KEYS.flatMap((collection) =>
    getEntries(collection).map((entry) => ({
      url: `${BASE_URL}/${collection}/${entry.slug}`,
      lastModified: new Date(),
    }))
  );

  return [...staticRoutes, ...entryRoutes];
}
