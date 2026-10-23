import { NextRequest, NextResponse } from 'next/server';
import { currentSession } from '@/lib/session';
import {
  viewerOf, lessonBySlug, catalogue, unlockedLevels, LEVEL_ORDER,
} from '@/lib/academy';
import { gradeQuiz, passedFinalLevels, passedTracks } from '@/lib/quiz';
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
    .select('kind, lesson_id, level, course_id').eq('id', body.quizId).maybeSingle();
  const quiz = q as {
    kind: string; lesson_id: string | null; level: string | null; course_id: string | null;
  } | null;
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

  /* ΤΑ ΤΕΛΙΚΑ ΚΑΙ ΤΟ ΟΛΙΚΟ ΕΧΟΥΝ ΤΟΝ ΔΙΚΟ ΤΟΥΣ ΕΛΕΓΧΟ, ΚΑΙ ΤΟΝ ΧΡΕΙΑΖΟΝΤΑΙ
     ΠΕΡΙΣΣΟΤΕΡΟ. Το τεστ ενός μαθήματος ξεκλειδώνει ένα βίντεο· το τελικό
     ξεκλειδώνει ολόκληρο επίπεδο και το ολικό δίνει πιστοποιητικό. Όποιος
     στείλει POST κατευθείαν εδώ, χωρίς αυτό το μπλοκ, θα μπορούσε να πάρει
     το χαρτί χωρίς να ανοίξει ποτέ ένα μάθημα. Ο διαχειριστής εξαιρείται:
     πρέπει να μπορεί να δοκιμάσει τα τεστ. */
  if (!v.admin && quiz.kind !== 'lesson') {
    const courses = await catalogue(v);
    const left = (pred: (c: (typeof courses)[number]) => boolean) =>
      courses.filter(pred).reduce((a, c) => a + (c.lessons - c.done), 0);

    if (quiz.kind === 'final' && quiz.level) {
      const open = await unlockedLevels(v);
      const ok = open.has(quiz.level as (typeof LEVEL_ORDER)[number])
        && left((c) => c.level === quiz.level && c.category !== 'track') === 0;
      if (!ok) return NextResponse.json({ error: 'locked' }, { status: 403 });
    }

    if (quiz.kind === 'track' && quiz.course_id) {
      if (left((c) => c.id === quiz.course_id) > 0) {
        return NextResponse.json({ error: 'locked' }, { status: 403 });
      }
    }

    if (quiz.kind === 'overall') {
      /* Τα tracks που ΕΧΟΥΝ τεστ, όχι όλα τα tracks: ένα track χωρίς τελικό
         τεστ δεν μπορεί να περαστεί, και θα κλείδωνε το ολικό για πάντα. */
      const [lv, tr, { data: tq }] = await Promise.all([
        passedFinalLevels(s.tid),
        passedTracks(s.tid),
        db().from('quizzes').select('course_id').eq('kind', 'track').eq('status', 'published'),
      ]);
      const need = ((tq ?? []) as Array<{ course_id: string | null }>)
        .map((r) => r.course_id).filter((x): x is string => Boolean(x));
      const levelsOk = LEVEL_ORDER.every((l) => lv.has(l));
      const tracksOk = need.every((id) => tr.has(id));
      if (!levelsOk || !tracksOk) {
        return NextResponse.json({ error: 'locked' }, { status: 403 });
      }
    }
  }

  const result = await gradeQuiz(s.tid, body.quizId, answers);
  if (!result) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(result);
}
