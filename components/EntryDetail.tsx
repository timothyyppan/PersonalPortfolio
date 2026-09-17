import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { COLLECTIONS } from '@/lib/collections';
import { formatDateRange } from '@/lib/format';
import type { Entry } from '@/lib/content';
import { DemoEmbed } from './DemoEmbed';
import { Reveal } from './Reveal';

export function EntryDetail({ entry }: { entry: Entry }) {
  const config = COLLECTIONS[entry.collection];
  const showDates = entry.collection === 'experience';

  return (
    <article className="py-12">
      <Link
        href={`/#${entry.collection}`}
        className="font-mono text-xs text-inkSoft transition-colors duration-200 hover:text-ink"
      >
        Back to {config.label.toLowerCase()}
      </Link>

      <Reveal>
        {showDates && (
          <div className="mt-6 font-mono text-xs text-inkSoft">
            {formatDateRange(entry.startDate, entry.endDate)}
          </div>
        )}

        <h1 className={`text-3xl leading-tight ${showDates ? 'mt-2' : 'mt-6'}`}>{entry.title}</h1>

        {entry.org && (
          <p className="mt-2 text-lg font-bold tracking-tight text-flag">{entry.org}</p>
        )}

        {(entry.role || entry.location) && (
          <p className="mt-1 text-inkSoft">
            {[entry.role, entry.location].filter(Boolean).join(' — ')}
          </p>
        )}

        <p className="mt-4 max-w-prose text-inkSoft">{entry.hook}</p>

        {entry.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <li
                key={tag}
                className="border border-rule px-2 py-0.5 font-mono text-xs text-inkSoft"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </Reveal>

      <Reveal delay={0.1}>
        <div className="prose prose-sm mt-10 max-w-prose prose-headings:font-serif prose-headings:font-normal prose-headings:text-ink prose-p:text-ink prose-a:text-ink prose-strong:text-ink prose-li:text-ink">
          <MDXRemote source={entry.content} />
        </div>
      </Reveal>

      <DemoEmbed slug={entry.slug} />

      <p className="mt-10 font-mono text-xs text-inkSoft">
        {config.label}
      </p>
    </article>
  );
}
