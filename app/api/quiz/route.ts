import { NextRequest, NextResponse } from 'next/server';
import { currentSession } from '@/lib/session';
import { viewerOf, lessonBySlug } from '@/lib/academy';
import { gradeQuiz } from '@/lib/quiz';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * =============================================================================
 * Υποβολή τεστ
 * =============================================================================
 *
 * ΕΔΩ ΚΑΙ ΜΟΝΟ ΕΔΩ ΒΑΘΜΟΛΟΓΕΙΤΑΙ ΕΝΑ ΤΕΣΤ. Η σελίδα στέλνει τι διάλεξε ο
 * χρήστης· τις σωστές απαντήσεις δεν τις έχει ποτέ για να τις συγκρίνει.
 *
 * ΓΙΑΤΙ ΕΛΕΓΧΟΥΜΕ ΞΑΝΑ ΤΗΝ ΠΡΟΣΒΑΣΗ: η σελίδα του μαθήματος δεν δείχνει τεστ
 * κλειδωμένου μαθήματος, αλλά αυτή η διαδρομή είναι ανοιχτή σε όποιον ξέρει να
 * στείλει ένα POST. Χωρίς τον έλεγχο, κάποιος θα μπορούσε να «περάσει» με τη
 * σειρά όλα τα τεστ στέλνοντας τυχαίες απαντήσεις μέχρι να πετύχει, χωρίς να
 * ανοίξει ποτέ την ακαδημία.
 */
export async function POST(req: NextRequest) {
  const s = currentSession();
  if (!s) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { quizId?: string; answers?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  if (!body.quizId || !Array.isArray(body.answers)) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const answers = (body.answers as unknown[]).map((x) => (typeof x === 'number' ? x : null));

  const { data: q } = await db().from('quizzes')
    .select('kind, lesson_id, level').eq('id', body.quizId).maybeSingle();
  const quiz = q as { kind: string; lesson_id: string | null; level: string | null } | null;
  if (!quiz) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const v = await viewerOf(s.tid);

  /* Τεστ μαθήματος: περνάει από τον ίδιο έλεγχο με το ίδιο το μάθημα. */
  if (quiz.kind === 'lesson' && quiz.lesson_id) {
    const { data: l } = await db().from('lessons')
      .select('slug, courses(slug)').eq('id', quiz.lesson_id).maybeSingle();
    if (!l) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const row = l as unknown as { slug: string; courses: { slug: string } | { slug: string }[] };
    const c = Array.isArray(row.courses) ? row.courses[0] : row.courses;
    const view = await lessonBySlug(v, c.slug, row.slug);
    if (!view || view.lesson.locked || view.lesson.gated) {
      return NextResponse.json({ error: 'locked' }, { status: 403 });
    }
  }

  const result = await gradeQuiz(s.tid, body.quizId, answers);
  if (!result) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(result);
}
