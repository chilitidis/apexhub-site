import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import {
  viewerOf, catalogue, unlockedLevels, unlockedBy, LEVEL_EL,
  type Level, type CourseView,
} from '@/lib/academy';
import { finalQuiz } from '@/lib/quiz';
import { ILock, ICheck } from '@/components/Icons';

export const dynamic = 'force-dynamic';

const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];

/**
 * Ο κατάλογος της ακαδημίας.
 *
 * ΟΧΙ ΜΙΑ ΣΟΥΠΑ ΑΠΟ ΚΑΡΤΕΣ. Η ύλη έχει σειρά και η σελίδα τη δείχνει: τα
 * επίπεδα είναι ενότητες, μέσα σε κάθε επίπεδο η ΔΙΑΔΡΟΜΗ (τα μαθήματα που
 * χτίζουν το ένα πάνω στο άλλο) κλείνει με το τελικό τεστ, και τα TRACKS —
 * όσα διαβάζονται όποτε θέλει κανείς — κάθονται χωριστά από κάτω.
 *
 * Ένα επίπεδο χωρίς περιεχόμενο ΔΕΝ εξαφανίζεται· φαίνεται κλειδωμένο. Το
 * μέλος πρέπει να ξέρει ότι υπάρχει συνέχεια και με τι ανοίγει.
 */
export default async function Catalogue({
  searchParams,
}: { searchParams: { q?: string; level?: string } }) {
  const s = currentSession();
  if (!s) redirect('/login');
  const v = await viewerOf(s.tid);
  const [all, beginnerFinal, open] = await Promise.all([
    catalogue(v),
    finalQuiz(s.tid, 'beginner'),
    unlockedLevels(v),
  ]);

  const q = (searchParams.q ?? '').trim().toLowerCase();
  const level = searchParams.level ?? '';

  const matches = (c: CourseView) =>
    !q || `${c.title} ${c.subtitle ?? ''} ${c.description ?? ''}`.toLowerCase().includes(q);

  const shown = LEVELS.filter((l) => !level || level === l);
  const hits = all.filter(matches);

  const href = (l: string) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (l) p.set('level', l);
    const qs = p.toString();
    return qs ? `/app/academy?${qs}` : '/app/academy';
  };

  const card = (c: CourseView) => (
    <Link key={c.id} href={`/app/academy/${c.slug}`}
          className={`card2 course ${c.locked ? 'locked' : ''}`}>
      <span className="course-cover">
        <span className="cover-art"><span>{c.title}</span></span>
        {c.locked && <span className="lockpill"><ILock /></span>}
        {c.status === 'draft' && <span className="draftpill">Πρόχειρο</span>}
      </span>
      <span className="course-body">
        <b className="h2">{c.title}</b>
        {c.subtitle && <span className="course-sub">{c.subtitle}</span>}
        <span className="meta num course-facts">
          {c.lessons} μαθήματα{c.minutes ? ` · ${c.minutes} λεπτά` : ''}
        </span>
        <span className="course-prog">
          <span className="bar">
            <span style={{ width: `${c.lessons ? (c.done / c.lessons) * 100 : 0}%` }} />
          </span>
          <span className="meta num">{c.done}/{c.lessons}</span>
        </span>
      </span>
    </Link>
  );

  return (
    <>
      <header className="hero">
        <h1 className="h1">Ακαδημία</h1>
        <p className="sub">
          Δομημένη διαδρομή. Κάθε ενότητα πατάει στην προηγούμενη, και κάθε
          επίπεδο ανοίγει με το τελικό του τεστ.
        </p>
      </header>

      {/* Segmented control: ένα πλαίσιο, ο δείκτης γλιστράει μέσα του. */}
      <div className="seg" role="group" aria-label="Επίπεδο">
        <Link href={href('')} className={!level ? 'on' : ''}>Όλα</Link>
        {LEVELS.map((l) => (
          <Link key={l} href={href(l)} className={level === l ? 'on' : ''}>{LEVEL_EL[l]}</Link>
        ))}
      </div>

      {q && hits.length === 0 && (
        <div className="empty2" style={{ marginTop: 28 }}>
          <b>Δεν βρέθηκε ενότητα.</b>
          Δοκίμασε άλλον όρο από το «{q}».
        </div>
      )}

      {shown.map((l, i) => {
        const path = hits.filter((c) => c.level === l && c.category !== 'track');
        const tracks = hits.filter((c) => c.level === l && c.category === 'track');
        const empty = path.length === 0 && tracks.length === 0;
        /* Κλειδωμένο επίπεδο: υπάρχει υλικό, αλλά δεν έχει ανοίξει ακόμη. */
        const locked = !open.has(l);
        const prev = unlockedBy(l);

        /* Ένα κενό επίπεδο κατά την αναζήτηση δεν είναι «κλειδωμένο», είναι
           απλώς εκτός αποτελεσμάτων. Δεν δείχνουμε λουκέτο εκεί. */
        if (empty && q) return null;

        return (
          <section className="sec level" key={l}>
            <div className="sec-top">
              <h2>Επιπεδο {i + 1} · {LEVEL_EL[l].toUpperCase()}</h2>
            </div>

            {empty || locked ? (
              <div className="locked-level">
                <span className="locked-ic"><ILock /></span>
                <div>
                  <b className="h2">
                    {empty ? 'Δεν έχει ανοίξει ακόμη' : `${path.length + tracks.length === 1 ? 'Μία ενότητα' : `${path.length + tracks.length} ενότητες`} σε αναμονή`}
                  </b>
                  <p>
                    {prev
                      ? <>Ξεκλειδώνει με το Τελικό τεστ {LEVEL_EL[prev] === 'Αρχάριος' ? 'Αρχαρίων' : LEVEL_EL[prev]}.</>
                      : 'Το περιεχόμενο ετοιμάζεται.'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {path.length > 0 && <div className="grid g3">{path.map(card)}</div>}

                {/* Το τελικό τεστ κλείνει τη διαδρομή του επιπέδου. */}
                {l === 'beginner' && beginnerFinal && !q && (
                  <Link href="/app/academy/final" className="finalcard">
                    <span className="finalcard-ic">
                      {beginnerFinal.passed ? <ICheck /> : <ILock />}
                    </span>
                    <span className="finalcard-txt">
                      <span className="eyebrow sm">Κλεινει το επιπεδο</span>
                      <b className="h2">{beginnerFinal.title ?? 'Τελικό τεστ'}</b>
                      <em>
                        {beginnerFinal.passed
                          ? 'Το έχεις περάσει. Το επόμενο επίπεδο σε περιμένει.'
                          : `${beginnerFinal.needed} σωστές από ${beginnerFinal.total} για να ανοίξει το επόμενο επίπεδο.`}
                      </em>
                    </span>
                    <span className="meta">{beginnerFinal.passed ? 'Ολοκληρώθηκε' : 'Δώσ’ το →'}</span>
                  </Link>
                )}

                {tracks.length > 0 && (
                  <div className="tracks">
                    {/* Δεν κλειδώνουν τίποτα και δεν τα κλειδώνει τίποτα:
                        διαβάζονται όποτε θέλει κανείς, παράλληλα με τη
                        διαδρομή. Γι' αυτό κάθονται χωριστά, από κάτω. */}
                    <div className="sec-top sub-top"><h2>Η νοοτροπια</h2></div>
                    <div className="grid g3">{tracks.map(card)}</div>
                  </div>
                )}
              </>
            )}
          </section>
        );
      })}
    </>
  );
}
