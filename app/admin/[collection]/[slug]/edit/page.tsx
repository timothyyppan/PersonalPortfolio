import { notFound } from 'next/navigation';
import { EntryForm } from '@/components/admin/EntryForm';
import { assertCollection, type CollectionConfig } from '@/lib/collections';
import { getEntry } from '@/lib/content';
import { isAdminEnabled } from '@/lib/devGuard';
import { parseSections } from '@/lib/entries';

export default function EditEntryPage({ params }: { params: { collection: string; slug: string } }) {
  if (!isAdminEnabled()) notFound();
  let config: CollectionConfig;
  try { config = assertCollection(params.collection); } catch { notFound(); }
  const entry = getEntry(config.key, params.slug);
  if (!entry) notFound();
  return <div className="py-12">
    <h1 className="text-3xl">{entry.title}</h1>
    <p className="mt-2 font-mono text-xs text-inkSoft">{config.label} — {entry.slug}</p>
    <div className="mt-10"><EntryForm collection={config.key} slug={entry.slug} initial={{ title: entry.title, tags: entry.tags, startDate: entry.startDate, endDate: entry.endDate ?? '', status: entry.status, hook: entry.hook, org: entry.org, role: entry.role, location: entry.location, sections: parseSections(entry.content, config.sections) }} /></div>
  </div>;
}
