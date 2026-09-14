import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { COLLECTIONS, type CollectionKey } from '@/lib/collections';
import { formatPlayed } from '@/lib/format';
import { getEntries, type Entry } from '@/lib/content';
import { DemoEmbed } from './DemoEmbed';

function holeNumber(collection: CollectionKey, slug: string): number {
  return getEntries(collection).findIndex((e) => e.slug === slug) + 1;
}

export function EntryDetail({ entry }: { entry: Entry }) {
  const config = COLLECTIONS[entry.collection];
  const hole = holeNumber(entry.collection, entry.slug);

  return (
    <article className="py-12">
      <Link href={`/${entry.collection}`} className="font-mono text-xs text-inkSoft">
        Back to the card
      </Link>

      <div className="mt-6 flex items-baseline gap-3 font-mono text-xs text-inkSoft">
        {hole > 0 && <span>Hole {String(hole).padStart(2, '0')}</span>}
        <span>{formatPlayed(entry.startDate, entry.endDate, entry.status)}</span>
        <span>{entry.status === 'complete' ? 'Complete' : 'In progress'}</span>
      </div>

      <h1 className="mt-2 text-3xl leading-tight">{entry.title}</h1>

      {entry.org && (
        <p className="mt-2 text-inkSoft">
          {entry.role ? `${entry.role}, ` : ''}
          {entry.org}
          {entry.location ? ` — ${entry.location}` : ''}
        </p>
      )}

      <p className="mt-4 max-w-prose text-inkSoft">{entry.hook}</p>

      {entry.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <li key={tag} className="border border-rule px-2 py-0.5 font-mono text-xs text-inkSoft">
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="prose prose-sm mt-10 max-w-prose prose-headings:font-serif prose-headings:font-normal prose-headings:text-ink prose-p:text-ink prose-a:text-ink prose-strong:text-ink prose-li:text-ink">
        <MDXRemote source={entry.content} />
      </div>

      <DemoEmbed slug={entry.slug} />

      <p className="mt-10 font-mono text-xs text-inkSoft">
        {config.label} · {config.nine}
      </p>
    </article>
  );
}
