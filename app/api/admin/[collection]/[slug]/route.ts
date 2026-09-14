import { NextResponse } from 'next/server';
import { isAdminEnabled } from '@/lib/devGuard';
import { assertCollection, assertSlug } from '@/lib/collections';
import { updateEntry, deleteEntry, type EntryInput } from '@/lib/entries';

export const dynamic = 'force-dynamic';

const notFound = () => NextResponse.json({ error: 'Not found' }, { status: 404 });

type Params = { params: { collection: string; slug: string } };

function resolve(params: Params['params']) {
  return { collection: assertCollection(params.collection).key, slug: assertSlug(params.slug) };
}

function isValidInput(body: unknown): body is EntryInput {
  if (typeof body !== 'object' || body === null) return false;
  const input = body as Record<string, unknown>;
  return (
    typeof input.title === 'string' &&
    Array.isArray(input.tags) &&
    input.tags.every((tag) => typeof tag === 'string') &&
    typeof input.startDate === 'string' &&
    (input.status === 'complete' || input.status === 'in-progress') &&
    typeof input.sections === 'object' &&
    input.sections !== null &&
    Object.values(input.sections as Record<string, unknown>).every((v) => typeof v === 'string') &&
    typeof input.hook === 'string'
  );
}

export async function PUT(request: Request, { params }: Params) {
  if (!isAdminEnabled()) return notFound();

  let target;
  try {
    target = resolve(params);
  } catch {
    return notFound();
  }

  const body = await request.json().catch(() => null);
  if (!isValidInput(body)) {
    return NextResponse.json({ error: 'The submitted entry is incomplete.' }, { status: 400 });
  }

  try {
    updateEntry(target.collection, target.slug, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!isAdminEnabled()) return notFound();

  let target;
  try {
    target = resolve(params);
  } catch {
    return notFound();
  }

  try {
    deleteEntry(target.collection, target.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}
