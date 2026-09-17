'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { COLLECTIONS, type CollectionKey } from '@/lib/collections';
import { formatDateRange } from '@/lib/format';
import type { Entry } from '@/lib/content';

// Full literal class names (Tailwind's JIT scanner needs the complete, unbroken string
// somewhere in the file -- interpolating pieces of a class name defeats detection). Shared
// between the header row and each entry row so the two can't drift out of column alignment.
const HEADER_GRID_WITH_DATES = 'grid-cols-[3rem_1fr_11rem_12rem]';
const HEADER_GRID_NO_DATES = 'grid-cols-[3rem_1fr_11rem]';
const ROW_GRID_WITH_DATES = 'sm:grid-cols-[3rem_1fr_11rem_12rem]';
const ROW_GRID_NO_DATES = 'sm:grid-cols-[3rem_1fr_11rem]';

export function Scorecard({
  collection,
  entries,
}: {
  collection: CollectionKey;
  entries: Entry[];
}) {
  const config = COLLECTIONS[collection];
  const reduceMotion = useReducedMotion();
  const showDates = collection === 'experience';
  const headerGrid = showDates ? HEADER_GRID_WITH_DATES : HEADER_GRID_NO_DATES;
  const rowGrid = showDates ? ROW_GRID_WITH_DATES : ROW_GRID_NO_DATES;

  return (
    <section className="border border-rule bg-cardRaised">
      <div
        data-testid="scorecard-header"
        className="flex items-baseline justify-between border-b border-rule px-4 py-3"
      >
        <h2 className="text-base">Selected {config.label.toLowerCase()}</h2>
        <span className="font-mono text-xs text-inkSoft">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="px-4 py-8 text-sm text-inkSoft">
          No {config.label.toLowerCase()} yet. Add one from the admin page.
        </p>
      ) : (
        <>
          <div className={`hidden ${headerGrid} gap-2 border-b border-rule px-4 py-2 font-mono text-[0.7rem] text-inkSoft sm:grid`}>
            <span>NO.</span>
            <span>{config.itemHeader}</span>
            <span>TOOLS</span>
            {showDates && <span>DATES</span>}
          </div>

          <ul>
            {entries.map((entry, index) => (
              <motion.li
                key={entry.slug}
                className="border-b border-ruleSoft last:border-b-0"
                initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: 'easeOut' }}
              >
                <Link
                  href={`/${collection}/${entry.slug}`}
                  aria-label={
                    showDates
                      ? `${entry.title}, ${entry.org}, ${formatDateRange(entry.startDate, entry.endDate)}`
                      : entry.title
                  }
                  className={`grid grid-cols-1 gap-1 px-4 py-4 transition-colors duration-200 hover:bg-card ${rowGrid} sm:items-baseline sm:gap-2`}
                >
                  <span className="font-mono text-xs text-inkSoft">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span>
                    {entry.org && (
                      <span className="block text-base font-bold tracking-tight text-flag">
                        {entry.org}
                      </span>
                    )}
                    <span className="block">{entry.title}</span>
                    <span className="mt-1 block text-sm text-inkSoft">{entry.hook}</span>
                  </span>

                  <span className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-inkSoft">
                    {entry.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </span>

                  {showDates && (
                    <span className="font-mono text-xs text-inkSoft">
                      {formatDateRange(entry.startDate, entry.endDate)}
                    </span>
                  )}
                </Link>
              </motion.li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
