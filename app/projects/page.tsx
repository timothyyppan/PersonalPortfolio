import type { Metadata } from 'next';
import { CollectionIndex } from '@/components/CollectionIndex';

export const metadata: Metadata = { title: 'Projects' };

export default function ProjectsPage() {
  return <CollectionIndex collection="projects" />;
}
