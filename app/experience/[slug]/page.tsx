import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEntries, getEntry } from '@/lib/content';
import { EntryDetail } from '@/components/EntryDetail';

export function generateStaticParams() {
  return getEntries('experience').map((entry) => ({ slug: entry.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const entry = getEntry('experience', params.slug);
  if (!entry) return {};
  return { title: entry.title, description: entry.hook };
}

export default function ExperienceDetailPage({ params }: { params: { slug: string } }) {
  const entry = getEntry('experience', params.slug);
  if (!entry) notFound();

  return <EntryDetail entry={entry} />;
}
