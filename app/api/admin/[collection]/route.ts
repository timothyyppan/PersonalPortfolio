import { NextResponse } from 'next/server';
import { isAdminEnabled } from '@/lib/devGuard';
import { assertCollection } from '@/lib/collections';
import { getEntries } from '@/lib/content';
import { createEntry } from '@/lib/entries';

export const dynamic = 'force-dynamic';

const notFound = () => NextResponse.json({ error: 'Not found' }, { status: 404 });

export async function GET(_request: Request, { params }: { params: { collection: string } }) {
  if (!isAdminEnabled()) return notFound();

  try {
    const config = assertCollection(params.collection);
    return NextResponse.json(getEntries(config.key));
  } catch {
    return notFound();
  }
}

export async function POST(request: Request, { params }: { params: { collection: string } }) {
  if (!isAdminEnabled()) return notFound();

  let collection;
  try {
    collection = assertCollection(params.collection).key;
  } catch {
    return notFound();
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.title !== 'string' || body.title.trim() === '') {
    return NextResponse.json({ error: 'A title is required.' }, { status: 400 });
  }

  try {
    return NextResponse.json({ slug: createEntry(collection, body.title.trim()) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 409 });
  }
}
