import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { currentSession } from '@/lib/session';
import {
  viewerOf, catalogue, unlockedLevels, unlockedBy, LEVEL_EL, LEVEL_ORDER,
  type Level,
} from '@/lib/academy';
import {
  finalQuiz, trackQuiz, overallQuiz, passedFinalLevels, passedTracks,
  type QuizView,
} from '@/lib/quiz';
import Quiz from '@/components/Quiz';
import { ILock } from '@/components/Icons';

export const dynamic = 'force-dynamic';

/* Τα tracks που μπορούν να έχουν δικό τους τελικό τεστ. */
const TRACKS = ['psychology', 'mindset'];

/**
 * =============================================================================
 * Κάθε τελικό τεστ της ακαδημίας, σε μία σελίδα
 * =============================================================================
 *
 * ΕΞΙ ΚΛΕΙΔΙΑ, ΕΝΑ ΑΡΧΕΙΟ: `beginner`, `intermediate`, `advanced` για τα τρία
 * επίπεδα, `psychology` και `mindset` για τα δύο tracks, και `overall` για το
 * ολικό τεστ που δίνει το πιστοποιητικό. (Ο φάκελος λέγεται ακόμη `[level]`
 * από τότε που υπήρχε μόνο το τεστ του Αρχάριου· το όνομα του φακέλου δεν
 * φαίνεται πουθενά, και η μετονομασία θα έσπαγε τα links που κυκλοφορούν.)
 *
 * ΤΟ ΚΛΕΙΔΩΜΑ ΔΕΝ ΕΙΝΑΙ ΤΟ ΙΔΙΟ ΓΙΑ ΟΛΑ:
 *   · Επίπεδο — πρέπει να έχει ανοίξει ΚΑΙ να έχει τελειώσει η διαδρομή του.
 *   · Track   — δεν κλειδώνεται από επίπεδο· αρκεί να έχει τελειώσει το ίδιο
 *               το track. Τα δύο tracks δεν κλειδώνουν το ένα το άλλο.
 *   · Ολικό   — θέλει και τα πέντε τελικά περασμένα. Το πιστοποιητικό λέει
 *               «ολοκλήρωσε την ακαδημία»· αν άνοιγε νωρίτερα, θα έλεγε ψέματα.
 *
 * Ο διαχειριστής μπαίνει πάντα: πρέπει να μπορεί να ελέγξει το τεστ χωρίς να
 * περάσει ενενήντα οκτώ μαθήματα πρώτα.
 */
export default async function FinalQuizPage({
  params,
}: { params: { level: string } }) {
  const s = currentSession();
  if (!s) redirect('/login');
  const key = params.level;

  const isLevel = (LEVEL_ORDER as string[]).includes(key);
  const isTrack = TRACKS.includes(key);
  if (!isLevel && !isTrack && key !== 'overall') notFound();

  const v = await viewerOf(s.tid);
  const courses = await catalogue(v);

  let quiz: QuizView | null = null;
  let eyebrow = '';
  let blocked: { title: string; why: ReactNode } | null = null;

  if (isLevel) {
    const level = key as Level;
    const [q, open] = await Promise.all([finalQuiz(s.tid, level), unlockedLevels(v)]);
    quiz = q;
    eyebrow = `Επιπεδο ${LEVEL_ORDER.indexOf(level) + 1} · ${LEVEL_EL[level]}`;

    const prev = unlockedBy(level);
    const left = courses
      .filter((c) => c.level === level && c.category !== 'track')
      .reduce((a, c) => a + (c.lessons - c.done), 0);

    if (!open.has(level)) {
      blocked = {
        title: 'Αυτό το επίπεδο δεν έχει ανοίξει ακόμη.',
        why: prev
          ? <>Ανοίγει με το Τελικό τεστ {LEVEL_EL[prev] === 'Αρχάριος' ? 'Αρχαρίων' : LEVEL_EL[prev]}.</>
          : 'Το περιεχόμενο ετοιμάζεται.',
      };
    } else if (left > 0) {
      blocked = { title: 'Δεν έχεις ολοκληρώσει ακόμη τη διαδρομή.', why: leftText(left) };
    }
  } else if (isTrack) {
    const course = courses.find((c) => c.slug === key);
    if (!course) notFound();
    quiz = await trackQuiz(s.tid, course.id);
    eyebrow = course.title;
    const left = course.lessons - course.done;
    if (left > 0) blocked = { title: `Δεν έχεις τελειώσει ακόμη τα μαθήματα «${course.title}».`, why: leftText(left) };
  } else {
    const [q, lv, tr] = await Promise.all([
      overallQuiz(s.tid), passedFinalLevels(s.tid), passedTracks(s.tid),
    ]);
    quiz = q;
    eyebrow = 'Ολη η ακαδημια';

    const missing = [
      ...LEVEL_ORDER.filter((l) => !lv.has(l)).map((l) => LEVEL_EL[l]),
      ...courses.filter((c) => TRACKS.includes(c.slug) && !tr.has(c.id)).map((c) => c.title),
    ];
    if (missing.length) {
      blocked = {
        title: 'Το ολικό τεστ ανοίγει στο τέλος.',
        why: <>Θέλει και τα πέντε τελικά τεστ περασμένα. Σου {missing.length === 1 ? 'λείπει' : 'λείπουν'}: {missing.join(', ')}.</>,
      };
    }
  }

  if (!quiz) notFound();
  const ready = v.admin || !blocked;

  return (
    <>
      <header className="hero">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="h1" style={{ marginTop: 14 }}>{quiz.title ?? 'Τελικό τεστ'}</h1>
        <p className="sub">
          {quiz.intro
            ?? `${quiz.total} ερωτήσεις από όλη την ύλη. Χρειάζονται ${quiz.needed} σωστές.`}
        </p>
      </header>

      {/* Περασμένο ολικό: η σελίδα δείχνει πρώτα τον δρόμο προς το
          πιστοποιητικό, και μετά το τεστ για όποιον θέλει να το ξαναδώσει. */}
      {key === 'overall' && quiz.passed && (
        <Link href="/app/academy/certificate" className="finalcard" style={{ marginTop: 28 }}>
          <span className="finalcard-txt">
            <span className="eyebrow sm">Το πιστοποιητικο σου</span>
            <b className="h2">Είναι έτοιμο</b>
            <em>Με το όνομά σου, την ημερομηνία και το ποσοστό σου.</em>
          </span>
          <span className="meta">Δες το →</span>
        </Link>
      )}

      {!ready && blocked ? (
        <div className="gate2" style={{ marginTop: 34 }}>
          <span className="gate2-ic"><ILock /></span>
          <b>{blocked.title}</b>
          <p>{blocked.why}</p>
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

function leftText(left: number) {
  return (
    <>
      Το τελικό τεστ ανοίγει όταν τελειώσεις όλα τα μαθήματα.
      Σου {left === 1 ? 'μένει 1 μάθημα' : `μένουν ${left} μαθήματα`}.
    </>
  );
}
