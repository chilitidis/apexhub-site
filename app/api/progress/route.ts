import { NextRequest, NextResponse } from 'next/server';
import { currentSession } from '@/lib/session';
import { setDone, viewerOf, lessonBySlug } from '@/lib/academy';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Καταγραφή προόδου.
 *
 * ΕΛΕΓΧΟΣ ΚΑΙ ΕΔΩ: χωρίς αυτόν, οποιοσδήποτε θα μπορούσε να στείλει το id ενός
 * κλειδωμένου μαθήματος και να το «ολοκληρώσει». Δεν θα έβλεπε το βίντεο, αλλά
 * θα μόλυνε την πρόοδό του και τα δικά μας στατιστικά.
 */
export async function POST(req: NextRequest) {
  const s = currentSession();
  if (!s) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { lessonId?: string; done?: boolean };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  if (!body.lessonId) return NextResponse.json({ error: 'missing lessonId' }, { status: 400 });

  const v = await viewerOf(s.tid);

  const { data: l } = await db().from('lessons')
    .select('slug, courses(slug)').eq('id', body.lessonId).maybeSingle();
  if (!l) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const row = l as unknown as { slug: string; courses: { slug: string } | { slug: string }[] };
  const c = Array.isArray(row.courses) ? row.courses[0] : row.courses;
  const view = await lessonBySlug(v, c.slug, row.slug);
  if (!view || view.lesson.locked) {
    return NextResponse.json({ error: 'locked' }, { status: 403 });
  }

  await setDone(s.tid, body.lessonId, Boolean(body.done));
  return NextResponse.json({ ok: true, done: Boolean(body.done) });
}
