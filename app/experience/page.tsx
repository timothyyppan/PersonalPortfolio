import type { Metadata } from 'next';
import { CollectionIndex } from '@/components/CollectionIndex';

export const metadata: Metadata = { title: 'Experience' };

export default function ExperiencePage() {
  return <CollectionIndex collection="experience" />;
}
