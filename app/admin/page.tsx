import { notFound } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { COLLECTION_KEYS, type CollectionKey } from '@/lib/collections';
import { getEntries, type Entry } from '@/lib/content';
import { isAdminEnabled } from '@/lib/devGuard';

export default function AdminPage() {
  if (!isAdminEnabled()) notFound();
  const entries = Object.fromEntries(COLLECTION_KEYS.map((collection) => [collection, getEntries(collection)])) as Record<CollectionKey, Entry[]>;
  return <div className="py-12">
    <h1 className="text-3xl">Admin</h1>
    <p className="mt-3 max-w-prose text-inkSoft">Changes here write straight to the MDX files in <code>content/</code>. Commit them to publish.</p>
    <div className="mt-10"><AdminDashboard entries={entries} /></div>
  </div>;
}
