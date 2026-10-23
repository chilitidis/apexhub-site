import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { currentSession } from '@/lib/session';
import {
  viewerOf, catalogue, unlockedLevels, unlockedBy, LEVEL_EL, LEVEL_ORDER,
  type Level,
} from '@/lib/academy';
import { finalQuiz } from '@/lib/quiz';
import Quiz from '@/components/Quiz';
import { ILock } from '@/components/Icons';

export const dynamic = 'force-dynamic';

/**
 * Το τελικό τεστ ενός επιπέδου.
 *
 * ΕΝΑ ΑΡΧΕΙΟ ΓΙΑ ΤΑ ΤΡΙΑ ΕΠΙΠΕΔΑ, ΟΧΙ ΤΡΙΑ ΑΝΤΙΓΡΑΦΑ. Το τεστ του Αρχάριου
 * ζούσε κάποτε μόνο του σε μια σελίδα με το `'beginner'` γραμμένο μέσα της.
 * Όταν μπήκαν τα τεστ του Μεσαίου και του Προχωρημένου, αυτή η σελίδα δεν
 * τα έβλεπε — ο κατάλογος θα έδειχνε διαδρομή που τελειώνει πουθενά, και το
 * επόμενο επίπεδο δεν θα άνοιγε ποτέ.
 *
 * ΔΥΟ ΚΛΕΙΔΩΜΑΤΑ, ΟΧΙ ΕΝΑ:
 *   · Το επίπεδο πρέπει να έχει ανοίξει. Αλλιώς, με απευθείας διεύθυνση,
 *     κάποιος θα έδινε το τεστ του Προχωρημένου την πρώτη μέρα και θα
 *     ξεκλείδωνε τα πάντα χωρίς να δει ένα βίντεο.
 *   · Η διαδρομή του επιπέδου πρέπει να έχει ολοκληρωθεί. Αλλιώς το τεστ
 *     γίνεται λοταρία και το κλείδωμα κάθε μαθήματος ξεχωριστά είναι θέατρο.
 *
 * Ο διαχειριστής μπαίνει πάντα: πρέπει να μπορεί να ελέγξει το τεστ χωρίς να
 * περάσει εικοσιένα άλλα πρώτα.
 */
export default async function FinalQuizPage({
  params,
}: { params: { level: string } }) {
  const s = currentSession();
  if (!s) redirect('/login');

  const level = params.level as Level;
  if (!LEVEL_ORDER.includes(level)) notFound();

  const v = await viewerOf(s.tid);
  const [quiz, open, courses] = await Promise.all([
    finalQuiz(s.tid, level),
    unlockedLevels(v),
    catalogue(v),
  ]);
  if (!quiz) notFound();

  const i = LEVEL_ORDER.indexOf(level);
  const prev = unlockedBy(level);
  const levelOpen = open.has(level);

  const path = courses.filter((c) => c.level === level && c.category !== 'track');
  const left = path.reduce((a, c) => a + (c.lessons - c.done), 0);
  const ready = v.admin || (levelOpen && left === 0);

  return (
    <>
      <header className="hero">
        <span className="eyebrow">Επιπεδο {i + 1} · {LEVEL_EL[level]}</span>
        <h1 className="h1" style={{ marginTop: 14 }}>{quiz.title ?? 'Τελικό τεστ'}</h1>
        <p className="sub">
          {quiz.intro
            ?? `${quiz.total} ερωτήσεις από όλη την ύλη. Χρειάζονται ${quiz.needed} σωστές.`}
        </p>
      </header>

      {!ready ? (
        <div className="gate2" style={{ marginTop: 34 }}>
          <span className="gate2-ic"><ILock /></span>
          {!levelOpen ? (
            <>
              <b>Αυτό το επίπεδο δεν έχει ανοίξει ακόμη.</b>
              <p>
                {prev
                  ? <>Ανοίγει με το Τελικό τεστ {LEVEL_EL[prev] === 'Αρχάριος' ? 'Αρχαρίων' : LEVEL_EL[prev]}.</>
                  : 'Το περιεχόμενο ετοιμάζεται.'}
              </p>
            </>
          ) : (
            <>
              <b>Δεν έχεις ολοκληρώσει ακόμη τη διαδρομή.</b>
              <p>
                Το τελικό τεστ ανοίγει όταν τελειώσεις τα μαθήματα του επιπέδου.
                Σου {left === 1 ? 'μένει 1 μάθημα' : `μένουν ${left} μαθήματα`}.
              </p>
            </>
          )}
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
