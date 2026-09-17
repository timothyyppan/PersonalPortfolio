'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { COLLECTION_KEYS, COLLECTIONS, type CollectionKey } from '@/lib/collections';
import type { Entry } from '@/lib/content';

export function AdminDashboard({ entries }: { entries: Record<CollectionKey, Entry[]> }) {
  const router = useRouter();
  const [lists, setLists] = useState(entries);
  const [titles, setTitles] = useState<Record<CollectionKey, string>>({ projects: '', experience: '' });
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(collection: CollectionKey, event: React.FormEvent) {
    event.preventDefault();
    const title = titles[collection].trim();
    if (!title) return;
    setError(null);
    const response = await fetch(`/api/admin/${collection}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? 'The entry could not be created.');
      return;
    }
    setTitles((current) => ({ ...current, [collection]: '' }));
    router.push(`/admin/${collection}/${data.slug}/edit`);
    router.refresh();
  }

  async function handleDelete(collection: CollectionKey, entry: Entry) {
    if (!window.confirm(`Delete "${entry.title}"? This removes the file from disk.`)) return;
    setError(null);
    const response = await fetch(`/api/admin/${collection}/${entry.slug}`, { method: 'DELETE' });
    if (!response.ok) {
      setError('The entry could not be deleted.');
      return;
    }
    setLists((current) => ({ ...current, [collection]: current[collection].filter((item) => item.slug !== entry.slug) }));
    router.refresh();
  }

  return (
    <div className="space-y-12">
      {error && <p className="text-sm text-mark">{error}</p>}
      {COLLECTION_KEYS.map((collection) => {
        const config = COLLECTIONS[collection];
        const list = lists[collection];
        return <section key={collection} data-testid={`admin-${collection}`}>
          <h2 className="text-xl">{config.label}</h2>
          <form onSubmit={(event) => handleCreate(collection, event)} className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[16rem] flex-1">
              <label className="mb-1 block text-sm text-inkSoft" htmlFor={`new-${collection}`}>
                New {config.singular.toLowerCase()} title
              </label>
              <input id={`new-${collection}`} className="w-full border border-rule bg-cardRaised px-3 py-2" value={titles[collection]} onChange={(event) => setTitles((current) => ({ ...current, [collection]: event.target.value }))} />
            </div>
            <button type="submit" className="border border-ink px-5 py-2.5 text-sm">Create</button>
          </form>
          <ul className="mt-6 divide-y divide-ruleSoft border-t border-rule">
            {list.map((entry) => <li key={entry.slug} className="flex items-center justify-between gap-4 py-3">
              <div><div>{entry.title}</div><div className="font-mono text-xs text-inkSoft">{entry.slug} — {entry.status === 'complete' ? 'Complete' : 'In progress'}</div></div>
              <div className="flex shrink-0 gap-4 text-sm">
                <Link href={`/admin/${collection}/${entry.slug}/edit`} className="underline underline-offset-4">Edit</Link>
                <button type="button" aria-label={`Delete ${entry.title}`} onClick={() => handleDelete(collection, entry)} className="text-inkSoft underline underline-offset-4">Delete</button>
              </div>
            </li>)}
            {list.length === 0 && <li className="py-3 text-sm text-inkSoft">Nothing here yet. Add the first one above.</li>}
          </ul>
        </section>;
      })}
    </div>
  );
}
