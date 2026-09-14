'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { COLLECTIONS, type CollectionKey } from '@/lib/collections';

export interface EntryFormValues {
  title: string;
  tags: string[];
  startDate: string;
  endDate?: string;
  status: 'in-progress' | 'complete';
  hook: string;
  org?: string;
  role?: string;
  location?: string;
  sections: Record<string, string>;
}

const fieldClass = 'w-full border border-rule bg-cardRaised px-3 py-2 text-ink';
const labelClass = 'mb-1 block text-sm text-inkSoft';

export function EntryForm({
  collection,
  slug,
  initial,
}: {
  collection: CollectionKey;
  slug: string;
  initial: EntryFormValues;
}) {
  const router = useRouter();
  const config = COLLECTIONS[collection];
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch(`/api/admin/${collection}/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, endDate: values.endDate || undefined }),
    });

    setSaving(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? 'The entry could not be saved.');
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className={labelClass} htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className={fieldClass}
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
        />
        <p className="mt-1 text-xs text-inkSoft">
          The web address stays <code>/{collection}/{slug}</code> when you rename this, so existing
          links keep working.
        </p>
      </div>

      {collection === 'experience' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="org">
              Organization
            </label>
            <input
              id="org"
              className={fieldClass}
              value={values.org ?? ''}
              onChange={(e) => setValues({ ...values, org: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="role">
              Team or role
            </label>
            <input
              id="role"
              className={fieldClass}
              value={values.role ?? ''}
              onChange={(e) => setValues({ ...values, role: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="location">
              Location
            </label>
            <input
              id="location"
              className={fieldClass}
              value={values.location ?? ''}
              onChange={(e) => setValues({ ...values, location: e.target.value })}
            />
          </div>
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="tags">
          Tags, separated by commas
        </label>
        <input
          id="tags"
          className={fieldClass}
          value={values.tags.join(', ')}
          onChange={(e) =>
            setValues({
              ...values,
              tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
            })
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="startDate">
            Start date
          </label>
          <input
            id="startDate"
            type="date"
            className={fieldClass}
            value={values.startDate}
            onChange={(e) => setValues({ ...values, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="endDate">
            End date
          </label>
          <input
            id="endDate"
            type="date"
            className={fieldClass}
            value={values.endDate ?? ''}
            onChange={(e) => setValues({ ...values, endDate: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="status">
            Status
          </label>
          <select
            id="status"
            className={fieldClass}
            value={values.status}
            onChange={(e) =>
              setValues({ ...values, status: e.target.value as EntryFormValues['status'] })
            }
          >
            <option value="in-progress">In progress</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="hook">
          Hook
        </label>
        <input
          id="hook"
          className={fieldClass}
          value={values.hook}
          onChange={(e) => setValues({ ...values, hook: e.target.value })}
        />
      </div>

      {config.sections.map((section) => (
        <div key={section}>
          <label className={labelClass} htmlFor={section}>
            {section}
          </label>
          <textarea
            id={section}
            rows={8}
            className={`${fieldClass} font-mono text-sm`}
            value={values.sections[section] ?? ''}
            onChange={(e) =>
              setValues({
                ...values,
                sections: { ...values.sections, [section]: e.target.value },
              })
            }
          />
        </div>
      ))}

      {error && <p className="text-sm text-mark">{error}</p>}

      <button type="submit" disabled={saving} className="border border-ink px-5 py-2.5 text-sm">
        {saving ? 'Saving changes' : 'Save changes'}
      </button>
    </form>
  );
}
