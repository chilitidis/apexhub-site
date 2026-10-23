import 'server-only';
import { db } from './db';

/**
 * =============================================================================
 * Τα τεστ της ακαδημίας
 * =============================================================================
 *
 * Ο ΠΥΡΗΝΑΣ ΟΛΟΥ ΤΟΥ ΑΡΧΕΙΟΥ ΣΕ ΜΙΑ ΠΡΟΤΑΣΗ: η σωστή απάντηση δεν φεύγει ποτέ
 * από τον server πριν ο χρήστης υποβάλει.
 *
 * ΓΙΑΤΙ ΕΧΕΙ ΣΗΜΑΣΙΑ: το τεστ δεν βαθμολογεί — ΚΛΕΙΔΩΝΕΙ. Όποιος δει τις
 * απαντήσεις ξεκλειδώνει ολόκληρη την ακαδημία χωρίς να δει ούτε ένα βίντεο.
 * Σε μια σελίδα που στέλνει τις απαντήσεις μαζί με τις ερωτήσεις, αυτό είναι
 * δύο κλικ: δεξί κλικ → Προβολή πηγαίου κώδικα. Δεν χρειάζεται καν εργαλεία.
 *
 * Η ΣΥΝΕΠΕΙΑ ΣΤΟΝ ΚΩΔΙΚΑ: υπάρχουν δύο τύποι για την ίδια ερώτηση.
 *   · `QuizQuestion`  — ό,τι έχει η βάση, με το `a` (σωστή) και το `w` (εξήγηση).
 *                        Μένει ΜΟΝΟ μέσα σε αυτό το αρχείο.
 *   · `PublicQuestion` — ερώτηση και επιλογές. Μόνο αυτό φτάνει στη σελίδα.
 *
 * Η συνάρτηση που κάνει το πέρασμα είναι η `strip()`. Αν κάποια μέρα κάποιος
 * θελήσει να στείλει «λίγο παραπάνω» στον client, θα πρέπει να την αλλάξει —
 * και τότε θα διαβάσει αυτό το σχόλιο.
 * =============================================================================
 */

/** Όπως αποθηκεύεται. ΔΕΝ βγαίνει από αυτό το αρχείο. */
interface QuizQuestion {
  q: string;
  o: string[];
  a: number;
  w?: string;
  /** Ο αριθμός μαθήματος, μόνο στο τελικό τεστ: «Ξαναδές: Μάθημα 7». */
  l?: number;
}

/** Ό,τι επιτρέπεται να δει ο browser πριν την υποβολή. */
export interface PublicQuestion { q: string; o: string[]; l?: number }

export type QuizKind = 'lesson' | 'final' | 'track' | 'overall';

export interface QuizView {
  id: string;
  kind: QuizKind;
  title: string | null;
  intro: string | null;
  /** Πόσες σωστές χρειάζονται, σε απόλυτο αριθμό. Το ποσοστό μπερδεύει. */
  needed: number;
  total: number;
  pass_pct: number;
  questions: PublicQuestion[];
  passed: boolean;
  attempts: number;
  /** Η καλύτερη προσπάθεια μέχρι τώρα, για να μην ξεκινά από το μηδέν η οθόνη. */
  best: { score: number; total: number } | null;
}

/** Το αποτέλεσμα μιας υποβολής. Εδώ — και μόνο εδώ — φεύγουν οι σωστές. */
export interface QuizResult {
  score: number;
  total: number;
  needed: number;
  passed: boolean;
  review: Array<{ correct: number; chosen: number | null; why: string | null }>;
}

type Row = {
  id: string; kind: QuizKind; title: string | null; intro: string | null;
  pass_pct: number; questions: QuizQuestion[]; status: string;
};

const COLS = 'id, kind, title, intro, pass_pct, questions, status';

/**
 * Το κατώφλι σε απόλυτο αριθμό σωστών.
 *
 * `ceil` και όχι `round`: με 5 ερωτήσεις και 80%, το 4 είναι 4 — αλλά με 30
 * ερωτήσεις και 80% το 24 πρέπει να είναι 24, όχι 23,9 που στρογγυλοποιείται
 * προς τα κάτω και χαρίζει μια ερώτηση. Ένα τεστ που κλειδώνει περιεχόμενο δεν
 * χαρίζει.
 */
function needed(total: number, pct: number): number {
  return Math.ceil((total * pct) / 100);
}

function strip(qs: QuizQuestion[]): PublicQuestion[] {
  return qs.map((x) => (x.l == null ? { q: x.q, o: x.o } : { q: x.q, o: x.o, l: x.l }));
}

async function attemptsOf(tid: number, quizId: string) {
  const { data } = await db().from('quiz_attempts')
    .select('score, total, passed').eq('telegram_id', tid).eq('quiz_id', quizId);
  const rows = (data ?? []) as Array<{ score: number; total: number; passed: boolean }>;
  const best = rows.reduce<{ score: number; total: number } | null>(
    (b, r) => (b && b.score >= r.score ? b : { score: r.score, total: r.total }), null);
  return { attempts: rows.length, passed: rows.some((r) => r.passed), best };
}

function view(row: Row, a: Awaited<ReturnType<typeof attemptsOf>>): QuizView {
  const total = row.questions.length;
  return {
    id: row.id, kind: row.kind, title: row.title, intro: row.intro,
    total, pass_pct: row.pass_pct, needed: needed(total, row.pass_pct),
    questions: strip(row.questions),
    passed: a.passed, attempts: a.attempts, best: a.best,
  };
}

/** Το τεστ ενός μαθήματος, όπως το βλέπει ο συγκεκριμένος χρήστης. */
export async function quizForLesson(tid: number, lessonId: string): Promise<QuizView | null> {
  const { data } = await db().from('quizzes')
    .select('id, kind, title, intro, pass_pct, questions, status')
    .eq('lesson_id', lessonId).eq('status', 'published').maybeSingle();
  const row = data as Row | null;
  if (!row || !row.questions?.length) return null;
  return view(row, await attemptsOf(tid, row.id));
}

/** Το τελικό τεστ ενός επιπέδου. */
export async function finalQuiz(tid: number, level: string): Promise<QuizView | null> {
  const { data } = await db().from('quizzes')
    .select('id, kind, title, intro, pass_pct, questions, status')
    .eq('level', level).eq('status', 'published').maybeSingle();
  const row = data as Row | null;
  if (!row || !row.questions?.length) return null;
  return view(row, await attemptsOf(tid, row.id));
}

/**
 * Το τελικό τεστ ενός TRACK — της Ψυχολογίας ή της Νοοτροπίας.
 *
 * ΔΕΝ ΞΕΚΛΕΙΔΩΝΕΙ ΕΠΙΠΕΔΟ, και αυτό είναι σκόπιμο: τα δύο tracks διαβάζονται
 * παράλληλα με τη διαδρομή, από την πρώτη μέρα. Το τεστ τους μετράει μόνο
 * για το ολικό — και άρα για το πιστοποιητικό.
 */
export async function trackQuiz(tid: number, courseId: string): Promise<QuizView | null> {
  const { data } = await db().from('quizzes').select(COLS)
    .eq('course_id', courseId).eq('status', 'published').maybeSingle();
  const row = data as Row | null;
  if (!row || !row.questions?.length) return null;
  return view(row, await attemptsOf(tid, row.id));
}

/** Το ολικό τεστ όλης της ακαδημίας. Ένα, μοναδικό. */
export async function overallQuiz(tid: number): Promise<QuizView | null> {
  const { data } = await db().from('quizzes').select(COLS)
    .eq('kind', 'overall').eq('status', 'published').maybeSingle();
  const row = data as Row | null;
  if (!row || !row.questions?.length) return null;
  return view(row, await attemptsOf(tid, row.id));
}

/** Ποιων track έχει περάσει το τελικό. Επιστρέφει course_id. */
export async function passedTracks(tid: number): Promise<Set<string>> {
  const s = db();
  const { data: qs } = await s.from('quizzes')
    .select('id, course_id').eq('kind', 'track').eq('status', 'published');
  const rows = ((qs ?? []) as Array<{ id: string; course_id: string | null }>)
    .filter((r): r is { id: string; course_id: string } => Boolean(r.course_id));
  if (!rows.length) return new Set();

  const { data: at } = await s.from('quiz_attempts')
    .select('quiz_id').eq('telegram_id', tid).eq('passed', true)
    .in('quiz_id', rows.map((r) => r.id));

  const ok = new Set(((at ?? []) as Array<{ quiz_id: string }>).map((r) => r.quiz_id));
  return new Set(rows.filter((r) => ok.has(r.id)).map((r) => r.course_id));
}

/**
 * Η περασμένη προσπάθεια στο ολικό τεστ — το πιστοποιητικό στηρίζεται ΜΟΝΟ
 * σε αυτή. Επιστρέφει την ΚΑΛΥΤΕΡΗ περασμένη, όχι την τελευταία: αν κάποιος
 * ξαναδώσει το τεστ από περιέργεια και πάει χειρότερα, δεν του χαλάμε το
 * ποσοστό που ήδη κέρδισε.
 *
 * Το `null` σημαίνει «δεν το έχει περάσει» — και η σελίδα του πιστοποιητικού
 * δεν δείχνει τίποτα. Δεν υπάρχει άλλος δρόμος προς το πιστοποιητικό.
 */
export async function certificate(tid: number): Promise<{
  score: number; total: number; pct: number; at: string;
} | null> {
  const s = db();
  const { data: q } = await s.from('quizzes').select('id')
    .eq('kind', 'overall').eq('status', 'published').maybeSingle();
  const quiz = q as { id: string } | null;
  if (!quiz) return null;

  const { data } = await s.from('quiz_attempts')
    .select('score, total, created_at').eq('telegram_id', tid)
    .eq('quiz_id', quiz.id).eq('passed', true);
  const rows = (data ?? []) as Array<{ score: number; total: number; created_at: string }>;
  if (!rows.length) return null;

  const best = rows.reduce((b, r) => (b.score >= r.score ? b : r));
  return {
    score: best.score, total: best.total,
    pct: Math.round((best.score / best.total) * 100),
    at: best.created_at,
  };
}

/**
 * Ποια μαθήματα έχει ήδη «ξεκλειδώσει» ο χρήστης περνώντας το τεστ τους.
 *
 * ΕΝΑ ΕΡΩΤΗΜΑ ΓΙΑ ΟΛΟ ΤΟ ΜΑΘΗΜΑ, όχι ένα ανά lesson: η σελίδα του καταλόγου
 * δείχνει δώδεκα μαθήματα, και δώδεκα διαδοχικά ερωτήματα στη βάση θα έκαναν
 * το άνοιγμα της σελίδας αισθητά πιο αργό για πληροφορία που χωράει σε ένα.
 */
export async function passedLessons(tid: number, lessonIds: string[]): Promise<Set<string>> {
  if (!lessonIds.length) return new Set();
  const s = db();
  const { data: qs } = await s.from('quizzes')
    .select('id, lesson_id').in('lesson_id', lessonIds).eq('status', 'published');
  const quizzes = (qs ?? []) as Array<{ id: string; lesson_id: string }>;
  if (!quizzes.length) return new Set();

  const { data: at } = await s.from('quiz_attempts')
    .select('quiz_id').eq('telegram_id', tid).eq('passed', true)
    .in('quiz_id', quizzes.map((q) => q.id));

  const passedQuiz = new Set(((at ?? []) as Array<{ quiz_id: string }>).map((r) => r.quiz_id));
  return new Set(quizzes.filter((q) => passedQuiz.has(q.id)).map((q) => q.lesson_id));
}

/**
 * Ποιων ΕΠΙΠΕΔΩΝ το τελικό τεστ έχει περάσει ο χρήστης.
 *
 * ΔΥΟ ΕΡΩΤΗΜΑΤΑ ΑΝΤΙ ΓΙΑ ΕΝΑ ΜΕ JOIN, ΕΠΙΤΗΔΕΣ. Το PostgREST μπορεί να
 * ενώσει τους δύο πίνακες σε μία κλήση, αλλά όταν δύο πίνακες συνδέονται με
 * παραπάνω από ένα κλειδί η ένωση γίνεται διφορούμενη και η κλήση σκάει στην
 * παραγωγή — μας έχει ήδη ρίξει το portal μία φορά. Δύο καθαρά ερωτήματα
 * κοστίζουν ένα round-trip και δεν σπάνε ποτέ.
 */
export async function passedFinalLevels(tid: number): Promise<Set<string>> {
  const s = db();
  const { data: finals } = await s.from('quizzes')
    .select('id, level').eq('kind', 'final').eq('status', 'published');
  const rows = ((finals ?? []) as Array<{ id: string; level: string | null }>)
    .filter((r): r is { id: string; level: string } => Boolean(r.level));
  if (!rows.length) return new Set();

  const { data: at } = await s.from('quiz_attempts')
    .select('quiz_id').eq('telegram_id', tid).eq('passed', true)
    .in('quiz_id', rows.map((r) => r.id));

  const ok = new Set(((at ?? []) as Array<{ quiz_id: string }>).map((r) => r.quiz_id));
  return new Set(rows.filter((r) => ok.has(r.id)).map((r) => r.level));
}

/** Ποια μαθήματα ΕΧΟΥΝ τεστ. Ένα μάθημα χωρίς τεστ δεν μπλοκάρει κανέναν. */
export async function lessonsWithQuiz(lessonIds: string[]): Promise<Set<string>> {
  if (!lessonIds.length) return new Set();
  const { data } = await db().from('quizzes')
    .select('lesson_id').in('lesson_id', lessonIds).eq('status', 'published');
  return new Set(((data ?? []) as Array<{ lesson_id: string }>).map((r) => r.lesson_id));
}

/**
 * Βαθμολόγηση. Η ΜΟΝΗ διαδρομή που συγκρίνει απαντήσεις, και τρέχει στον server.
 *
 * Το `answers` έρχεται από τον χρήστη, άρα είναι ύποπτο: μπορεί να έχει λάθος
 * μήκος, τιμές εκτός ορίων ή κενά. Ό,τι δεν είναι έγκυρος δείκτης μετράει ως
 * αναπάντητο — ποτέ ως σωστό.
 */
export async function gradeQuiz(
  tid: number, quizId: string, answers: Array<number | null>,
): Promise<QuizResult | null> {
  const s = db();
  const { data } = await s.from('quizzes')
    .select('id, pass_pct, questions, status').eq('id', quizId).maybeSingle();
  const row = data as Row | null;
  if (!row || row.status !== 'published' || !row.questions?.length) return null;

  const qs = row.questions;
  const total = qs.length;
  const review = qs.map((x, i) => {
    const raw = answers[i];
    const chosen = Number.isInteger(raw) && (raw as number) >= 0 && (raw as number) < x.o.length
      ? (raw as number) : null;
    return { correct: x.a, chosen, why: x.w ?? null };
  });
  const score = review.filter((r) => r.chosen === r.correct).length;
  const need = needed(total, row.pass_pct);
  const passed = score >= need;

  /* Κάθε προσπάθεια γράφεται, και η αποτυχημένη. Όταν δέκα άνθρωποι κόβονται
     στην ίδια ερώτηση, το πρόβλημα είναι το βίντεο, όχι οι δέκα. */
  await s.from('quiz_attempts').insert({
    quiz_id: quizId, telegram_id: tid, score, total, passed,
    answers: review.map((r) => r.chosen),
  } as Record<string, unknown>);

  return { score, total, needed: need, passed, review };
}
