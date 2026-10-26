'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ICheck, ILock } from './Icons';

const T = {
  el: {
    finalH: 'Τελικό τεστ', lessonH: 'Τεστ μαθήματος', nextLevel: 'το επόμενο επίπεδο', nextLesson: 'το επόμενο μάθημα',
    err: 'Η υποβολή δεν ολοκληρώθηκε. Δοκίμασε ξανά σε λίγο.',
    passedB: 'Το έχεις περάσει.', passedP: 'Μπορείς να το ξαναδώσεις όποτε θέλεις, για επανάληψη.', again: 'Ξανά',
    endLevel: 'Τελος επιπεδου', endLesson: 'Τελος μαθηματος', nextStep: 'Επόμενο βήμα: Άσκηση',
    gate: (need: number, total: number, unl: string) => `${need} σωστές από ${total}. Χωρίς αυτό δεν ξεκλειδώνει ${unl}`,
    goEx: 'Πήγαινε στην άσκηση',
    attempts: (n: number) => (n === 1 ? 'Μία προσπάθεια μέχρι τώρα' : `${n} προσπάθειες μέχρι τώρα`),
    toOpen: (need: number, total: number, unl: string) => `${need} σωστές από ${total} για να ανοίξει ${unl}`,
    soFar: (n: number) => ` Προσπάθειες μέχρι τώρα: ${n}.`,
    checking: 'Γίνεται έλεγχος…', submit: 'Υποβολή',
    left: (n: number) => (n === 1 ? 'Μένει 1 ερώτηση' : `Μένουν ${n} ερωτήσεις`),
    pass: 'πέρασες', fail: 'δεν πέρασες',
    opened: (x: string) => `Το επόμενο μάθημα άνοιξε: ${x}.`, levelOpened: 'Το επόμενο επίπεδο άνοιξε.', lessonOpened: 'Το επόμενο μάθημα άνοιξε.',
    need: (n: number) => `Χρειάζονται ${n} σωστές. Διάβασε τις εξηγήσεις και ξαναδοκίμασε — δεν υπάρχει όριο προσπαθειών.`,
  },
  en: {
    finalH: 'Final test', lessonH: 'Lesson test', nextLevel: 'the next level', nextLesson: 'the next lesson',
    err: 'The submission did not go through. Try again shortly.',
    passedB: 'You’ve passed it.', passedP: 'You can retake it whenever you want, for revision.', again: 'Again',
    endLevel: 'End of level', endLesson: 'End of lesson', nextStep: 'Next step: Exercise',
    gate: (need: number, total: number, unl: string) => `${need} correct out of ${total}. Without it, ${unl} stays locked`,
    goEx: 'Go to the exercise',
    attempts: (n: number) => (n === 1 ? 'One attempt so far' : `${n} attempts so far`),
    toOpen: (need: number, total: number, unl: string) => `${need} correct out of ${total} to open ${unl}`,
    soFar: (n: number) => ` Attempts so far: ${n}.`,
    checking: 'Checking…', submit: 'Submit',
    left: (n: number) => (n === 1 ? '1 question left' : `${n} questions left`),
    pass: 'passed', fail: 'not passed',
    opened: (x: string) => `The next lesson is open: ${x}.`, levelOpened: 'The next level is open.', lessonOpened: 'The next lesson is open.',
    need: (n: number) => `You need ${n} correct. Read the explanations and try again — there is no limit on attempts.`,
  },
};

/**
 * =============================================================================
 * Το τεστ του μαθήματος
 * =============================================================================
 *
 * ΤΙ ΞΕΡΕΙ ΑΥΤΟ ΤΟ COMPONENT: τις ερωτήσεις και τις επιλογές. Τίποτε άλλο.
 * Τις σωστές απαντήσεις τις μαθαίνει ΜΟΝΟ ως απάντηση στην υποβολή, από τον
 * server. Αν κάποτε προστεθεί εδώ prop με τις σωστές «για να μη χρειάζεται
 * δεύτερο αίτημα», το κλείδωμα της ακαδημίας παύει να ισχύει.
 *
 * ΜΕΤΑ ΑΠΟ ΕΠΙΤΥΧΙΑ ΚΑΝΟΥΜΕ `router.refresh()`: το επόμενο μάθημα μόλις
 * ξεκλειδώθηκε, και η λίστα στο πλάι το δείχνει ακόμη με λουκέτο. Χωρίς αυτό,
 * ο χρήστης θα πίστευε ότι το τεστ δεν μέτρησε.
 */

interface PublicQuestion { q: string; o: string[]; l?: number }

interface Review { correct: number; chosen: number | null; why: string | null }
interface Result { score: number; total: number; needed: number; passed: boolean; review: Review[] }

export default function Quiz({
  quizId, questions, needed, passed, attempts, nextTitle, final = false, lang = 'el',
}: {
  quizId: string;
  questions: PublicQuestion[];
  needed: number;
  passed: boolean;
  attempts: number;
  nextTitle?: string | null;
  /** Τελικό τεστ επιπέδου: αλλάζει μόνο τα κείμενα, όχι τη λογική. */
  final?: boolean;
  lang?: 'el' | 'en';
}) {
  const t = T[lang];
  const heading = final ? t.finalH : t.lessonH;
  const unlocks = final ? t.nextLevel : t.nextLesson;
  const [picks, setPicks] = useState<Array<number | null>>(() => questions.map(() => null));
  const [res, setRes] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  /* Ένα ήδη περασμένο τεστ δείχνει μία γραμμή, όχι ερωτήσεις. Το `again`
     υπάρχει γιατί χωρίς αυτό το «Ξανά» θα επέστρεφε στην ίδια γραμμή: το
     `passed` δεν παύει να ισχύει επειδή ο χρήστης θέλει επανάληψη. */
  const [again, setAgain] = useState(false);
  /* Κλειστό μέχρι να το ζητήσει ο χρήστης. Βλ. την κάρτα τέλους πιο κάτω. */
  const [open, setOpen] = useState(false);
  const [, start] = useTransition();
  const router = useRouter();

  const total = questions.length;
  const unanswered = picks.filter((p) => p === null).length;

  /* Το scroll γίνεται ΜΕΤΑ το render του τεστ, αλλιώς κυνηγάει στοιχείο που
     δεν υπάρχει ακόμη στη σελίδα. */
  const jump = () => requestAnimationFrame(() =>
    document.getElementById(`quiz-${quizId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));

  async function submit() {
    setErr(null);
    setBusy(true);
    try {
      const r = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ quizId, answers: picks }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const data = (await r.json()) as Result;
      setRes(data);
      if (data.passed) start(() => router.refresh());
      document.getElementById(`quiz-${quizId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      setErr(t.err);
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    setPicks(questions.map(() => null));
    setRes(null);
    setErr(null);
    document.getElementById(`quiz-${quizId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* Ήδη περασμένο και δεν ξαναδίνει τώρα: μια γραμμή, όχι ολόκληρο τεστ. */
  if (passed && !res && !again) {
    return (
      <div className="sec quiz" id={`quiz-${quizId}`}>
        <div className="sec-top"><h2>{heading}</h2></div>
        <div className="quiz-done">
          <span className="quiz-ic"><ICheck /></span>
          <div>
            <b>{t.passedB}</b>
            <p>{t.passedP}</p>
          </div>
          <button type="button" className="btn" onClick={() => { setAgain(true); retry(); }}>
            {t.again}
          </button>
        </div>
      </div>
    );
  }

  /**
   * Η ΚΑΡΤΑ ΤΕΛΟΥΣ ΜΑΘΗΜΑΤΟΣ.
   *
   * Το τεστ δεν κρέμεται από κάτω σαν παράρτημα. Τελειώνει το βίντεο, πέφτει
   * η κάρτα, πατάς ένα κουμπί. Είναι βήμα, όχι υποσημείωση — και φαίνεται.
   *
   * ΜΕΧΡΙ ΤΟ ΚΛΙΚ ΟΙ ΕΡΩΤΗΣΕΙΣ ΔΕΝ ΜΠΑΙΝΟΥΝ ΚΑΝ ΣΤΗ ΣΕΛΙΔΑ. Είκοσι σειρές
   * με radio buttons κάτω από κάθε βίντεο κάνουν τη σελίδα να μοιάζει με
   * ερωτηματολόγιο· έτσι η σελίδα του μαθήματος είναι το μάθημα.
   */
  if (!open) {
    return (
      <div className="endcard" id={`quiz-${quizId}`}>
        <div className="endcard-grid" aria-hidden="true" />
        <div className="endcard-in">
          <span className="endcard-kick">{final ? t.endLevel : t.endLesson}</span>
          <h2>{t.nextStep}</h2>
          <p>
            {t.gate(needed, total, unlocks)}
            {nextTitle ? <>, {lang === 'en' ? `“${nextTitle}”` : `«${nextTitle}»`}</> : null}.
          </p>
          <button type="button" className="endcard-go" onClick={() => { setOpen(true); jump(); }}>
            {t.goEx} <span aria-hidden="true">→</span>
          </button>
          {attempts > 0 && (
            <span className="endcard-meta">
              {t.attempts(attempts)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="sec quiz" id={`quiz-${quizId}`}>
      <div className="sec-top"><h2>{heading}</h2></div>
      <p className="sub">
        {t.toOpen(needed, total, unlocks)}
        {nextTitle ? <> — <b>{nextTitle}</b></> : null}.
        {attempts > 0 && !res ? t.soFar(attempts) : ''}
      </p>

      <ol className="qlist">
        {questions.map((item, i) => {
          const rv = res?.review[i];
          return (
            <li key={i} className="qitem">
              <h3>{item.q}</h3>
              <div className="qopts">
                {item.o.map((opt, j) => {
                  const chosen = picks[i] === j;
                  let cls = 'qopt';
                  if (rv) {
                    if (j === rv.correct) cls += ' right';
                    else if (j === rv.chosen) cls += ' wrong';
                  } else if (chosen) cls += ' on';
                  return (
                    <label key={j} className={cls}>
                      <input
                        type="radio"
                        name={`${quizId}-${i}`}
                        checked={chosen}
                        disabled={Boolean(res)}
                        onChange={() => setPicks((p) => p.map((x, k) => (k === i ? j : x)))}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
              {rv?.why && <p className="qwhy">{rv.why}</p>}
            </li>
          );
        })}
      </ol>

      {err && <p className="qerr">{err}</p>}

      {!res ? (
        <div className="qactions">
          <button type="button" className="btn btn-solid" onClick={submit} disabled={busy || unanswered > 0}>
            {busy ? t.checking : t.submit}
          </button>
          {unanswered > 0 && (
            <span className="meta">
              {t.left(unanswered)}
            </span>
          )}
        </div>
      ) : (
        <div className={res.passed ? 'qresult ok' : 'qresult no'}>
          <span className="quiz-ic">{res.passed ? <ICheck /> : <ILock />}</span>
          <div>
            <b>{res.score} / {res.total} — {res.passed ? t.pass : t.fail}</b>
            <p>
              {res.passed
                ? (nextTitle ? t.opened(nextTitle)
                             : final ? t.levelOpened : t.lessonOpened)
                : t.need(res.needed)}
            </p>
          </div>
          <button type="button" className="btn" onClick={retry}>{t.again}</button>
        </div>
      )}
    </div>
  );
}
