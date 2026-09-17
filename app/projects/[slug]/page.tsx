import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEntries, getEntry } from '@/lib/content';
import { canShowEntryContent } from '@/lib/entryVisibility';
import { EntryDetail } from '@/components/EntryDetail';

export function generateStaticParams() {
  return getEntries('projects').map((entry) => ({ slug: entry.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const entry = getEntry('projects', params.slug);
  if (!entry) return {};
  if (!canShowEntryContent(entry.status)) return { title: 'Work in progress' };
  return { title: entry.title, description: entry.hook };
}

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const entry = getEntry('projects', params.slug);
  if (!entry) notFound();

  if (!canShowEntryContent(entry.status)) {
    return (
      <article className="py-12">
        <h1 className="text-3xl leading-tight">This project is still being worked on.</h1>
        <p className="mt-4 max-w-prose text-inkSoft">
          Check back soon for the full write-up.
        </p>
      </article>
    );
  }

  return <EntryDetail entry={entry} />;
}
