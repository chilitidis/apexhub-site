import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { viewerOf, catalogue } from '@/lib/academy';
import { finalQuiz } from '@/lib/quiz';
import Quiz from '@/components/Quiz';
import { ILock } from '@/components/Icons';

export const dynamic = 'force-dynamic';

/**
 * Το τελικό τεστ του επιπέδου «Αρχάριος».
 *
 * ΓΙΑΤΙ ΔΕΝ ΑΝΟΙΓΕΙ ΟΠΟΤΕ ΘΕΛΕΙ ΚΑΝΕΙΣ: κλείνει ένα ολόκληρο επίπεδο και
 * ξεκλειδώνει το επόμενο. Αν μπορούσε να δοθεί από την πρώτη μέρα, θα ήταν
 * μια λοταρία τριάντα ερωτήσεων — κάποιος θα περνούσε στην τύχη χωρίς να
 * δει ούτε ένα βίντεο, και το κλείδωμα κάθε μαθήματος ξεχωριστά θα ήταν
 * θέατρο. Απαιτούμε να έχει ολοκληρωθεί η διαδρομή του επιπέδου.
 *
 * Ο διαχειριστής μπαίνει πάντα: πρέπει να μπορεί να ελέγξει το τεστ χωρίς
 * να περάσει εικοσιένα άλλα πρώτα.
 */
export default async function FinalQuizPage() {
  const s = currentSession();
  if (!s) redirect('/login');

  const v = await viewerOf(s.tid);
  const quiz = await finalQuiz(s.tid, 'beginner');
  if (!quiz) notFound();

  const courses = await catalogue(v);
  const path = courses.filter((c) => c.level === 'beginner' && c.category !== 'track');
  const left = path.reduce((a, c) => a + (c.lessons - c.done), 0);
  const ready = v.admin || left === 0;

  return (
    <>
      <header className="hero">
        <span className="eyebrow">Επιπεδο 1 · Αρχαριος</span>
        <h1 className="h1" style={{ marginTop: 14 }}>{quiz.title ?? 'Τελικό τεστ'}</h1>
        <p className="sub">
          {quiz.intro
            ?? `${quiz.total} ερωτήσεις από όλη την ύλη. Χρειάζονται ${quiz.needed} σωστές.`}
        </p>
      </header>

      {!ready ? (
        <div className="gate2" style={{ marginTop: 34 }}>
          <span className="gate2-ic"><ILock /></span>
          <b>Δεν έχεις ολοκληρώσει ακόμη τη διαδρομή.</b>
          <p>
            Το τελικό τεστ ανοίγει όταν τελειώσεις τα μαθήματα του επιπέδου.
            Σου {left === 1 ? 'μένει 1 μάθημα' : `μένουν ${left} μαθήματα`}.
          </p>
          <Link className="gold-btn" href="/app/academy">Πίσω στην Ακαδημία</Link>
        </div>
      ) : (
        <Quiz
          quizId={quiz.id}
          questions={quiz.questions}
          needed={quiz.needed}
          passed={quiz.passed}
          attempts={quiz.attempts}
          nextTitle={null}
          final
        />
      )}
    </>
  );
}
