import Link from 'next/link';
import { COLLECTIONS, type CollectionKey } from '@/lib/collections';
import { formatPlayed } from '@/lib/format';
import type { Entry } from '@/lib/content';

// Full literal class names (Tailwind's JIT scanner needs the complete, unbroken string
// somewhere in the file -- interpolating pieces of a class name defeats detection). Shared
// between the header row and each entry row so the two can't drift out of column alignment.
const HEADER_GRID = 'grid-cols-[3rem_1fr_11rem_5rem_3rem]';
const ROW_GRID = 'sm:grid-cols-[3rem_1fr_11rem_5rem_3rem]';

function ScoreMark({ status }: { status: Entry['status'] }) {
  const complete = status === 'complete';
  return (
    <span
      role="img"
      aria-label={complete ? 'Complete' : 'In progress'}
      className={
        complete
          ? 'inline-block h-4 w-4 rounded-full border-[1.5px] border-mark'
          : 'inline-block h-4 w-4 border-[1.5px] border-inkSoft'
      }
    />
  );
}

export function Scorecard({
  collection,
  entries,
}: {
  collection: CollectionKey;
  entries: Entry[];
}) {
  const config = COLLECTIONS[collection];

  return (
    <section className="border border-rule bg-cardRaised">
      <div
        data-testid="scorecard-header"
        className="flex items-baseline justify-between border-b border-rule px-4 py-3"
      >
        <h2 className="text-base">The card</h2>
        <span className="font-mono text-xs text-inkSoft">
          {config.nine} · {entries.length} {entries.length === 1 ? 'hole' : 'holes'}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="px-4 py-8 text-sm text-inkSoft">
          No {config.label.toLowerCase()} on the card yet. Add one from the admin page.
        </p>
      ) : (
        <>
          <div className={`hidden ${HEADER_GRID} gap-2 border-b border-rule px-4 py-2 font-mono text-[0.7rem] text-inkSoft sm:grid`}>
            <span>HOLE</span>
            <span>{config.itemHeader}</span>
            <span>CLUBS</span>
            <span>PLAYED</span>
            <span className="text-center">CARD</span>
          </div>

          <ul>
            {entries.map((entry, index) => (
              <li key={entry.slug} className="border-b border-ruleSoft last:border-b-0">
                <Link
                  href={`/${collection}/${entry.slug}`}
                  aria-label={`${entry.title}, ${formatPlayed(entry.startDate, entry.endDate, entry.status)}, ${entry.status === 'complete' ? 'complete' : 'in progress'}`}
                  className={`grid grid-cols-1 gap-1 px-4 py-4 hover:bg-card ${ROW_GRID} sm:items-baseline sm:gap-2`}
                >
                  <span className="font-mono text-xs text-inkSoft">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span>
                    <span className="block">{entry.title}</span>
                    <span className="mt-1 block text-sm text-inkSoft sm:hidden">{entry.hook}</span>
                  </span>

                  <span className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-inkSoft">
                    {entry.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </span>

                  <span className="font-mono text-xs text-inkSoft">
                    {formatPlayed(entry.startDate, entry.endDate, entry.status)}
                  </span>

                  <span className="sm:text-center">
                    <ScoreMark status={entry.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-rule px-4 py-2 font-mono text-[0.7rem] text-inkSoft">
            <span className="mr-4">○ complete</span>
            <span>□ in progress</span>
          </div>
        </>
      )}
    </section>
  );
}
