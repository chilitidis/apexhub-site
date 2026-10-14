'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ICheck, ILock } from './Icons';

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
  quizId, questions, needed, passed, attempts, nextTitle,
}: {
  quizId: string;
  questions: PublicQuestion[];
  needed: number;
  passed: boolean;
  attempts: number;
  nextTitle?: string | null;
}) {
  const [picks, setPicks] = useState<Array<number | null>>(() => questions.map(() => null));
  const [res, setRes] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  /* Ένα ήδη περασμένο τεστ δείχνει μία γραμμή, όχι ερωτήσεις. Το `again`
     υπάρχει γιατί χωρίς αυτό το «Ξανά» θα επέστρεφε στην ίδια γραμμή: το
     `passed` δεν παύει να ισχύει επειδή ο χρήστης θέλει επανάληψη. */
  const [again, setAgain] = useState(false);
  const [, start] = useTransition();
  const router = useRouter();

  const total = questions.length;
  const unanswered = picks.filter((p) => p === null).length;

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
      setErr('Η υποβολή δεν ολοκληρώθηκε. Δοκίμασε ξανά σε λίγο.');
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
        <div className="sec-top"><h2>Τεστ μαθήματος</h2></div>
        <div className="quiz-done">
          <span className="quiz-ic"><ICheck /></span>
          <div>
            <b>Το έχεις περάσει.</b>
            <p>Μπορείς να το ξαναδώσεις όποτε θέλεις, για επανάληψη.</p>
          </div>
          <button type="button" className="btn" onClick={() => { setAgain(true); retry(); }}>
            Ξανά
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sec quiz" id={`quiz-${quizId}`}>
      <div className="sec-top"><h2>Τεστ μαθήματος</h2></div>
      <p className="sub">
        {needed} σωστές από {total} για να ανοίξει το επόμενο μάθημα
        {nextTitle ? <> — <b>{nextTitle}</b></> : null}.
        {attempts > 0 && !res ? ` Προσπάθειες μέχρι τώρα: ${attempts}.` : ''}
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
            {busy ? 'Γίνεται έλεγχος…' : 'Υποβολή'}
          </button>
          {unanswered > 0 && (
            <span className="meta">
              {unanswered === 1 ? 'Μένει 1 ερώτηση' : `Μένουν ${unanswered} ερωτήσεις`}
            </span>
          )}
        </div>
      ) : (
        <div className={res.passed ? 'qresult ok' : 'qresult no'}>
          <span className="quiz-ic">{res.passed ? <ICheck /> : <ILock />}</span>
          <div>
            <b>{res.score} / {res.total} — {res.passed ? 'πέρασες' : 'δεν πέρασες'}</b>
            <p>
              {res.passed
                ? (nextTitle ? `Το επόμενο μάθημα άνοιξε: ${nextTitle}.` : 'Το επόμενο μάθημα άνοιξε.')
                : `Χρειάζονται ${res.needed} σωστές. Διάβασε τις εξηγήσεις και ξαναδοκίμασε — δεν υπάρχει όριο προσπαθειών.`}
            </p>
          </div>
          <button type="button" className="btn" onClick={retry}>Ξανά</button>
        </div>
      )}
    </div>
  );
}
