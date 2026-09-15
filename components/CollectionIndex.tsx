import { COLLECTIONS, type CollectionKey } from '@/lib/collections';
import { getEntries } from '@/lib/content';
import { Scorecard } from './Scorecard';
import { Reveal } from './Reveal';

const INTRO: Record<CollectionKey, string> = {
  projects:
    'Things I built because I wanted them to exist. Each one has a full write-up: what I designed, what I planned, what broke.',
  experience: 'Where I have worked, and what I actually built while I was there.',
};

export function CollectionIndex({ collection }: { collection: CollectionKey }) {
  const config = COLLECTIONS[collection];
  const entries = getEntries(collection);

  return (
    <div className="py-12">
      <Reveal>
        <h1 className="text-3xl">{config.label}</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-3 max-w-prose text-inkSoft">{INTRO[collection]}</p>
      </Reveal>
      <Reveal delay={0.1} className="mt-8">
        <Scorecard collection={collection} entries={entries} />
      </Reveal>
    </div>
  );
}
