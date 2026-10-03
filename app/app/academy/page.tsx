import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { viewerOf, catalogue, LEVEL_EL, type Level } from '@/lib/academy';
import { ILock } from '@/components/Icons';

export const dynamic = 'force-dynamic';

export default async function Catalogue({
  searchParams,
}: { searchParams: { q?: string; level?: string; cat?: string } }) {
  const s = currentSession();
  if (!s) redirect('/login');
  const v = await viewerOf(s.tid);
  const all = await catalogue(v);

  const q = (searchParams.q ?? '').trim().toLowerCase();
  const level = searchParams.level ?? '';
  const cat = searchParams.cat ?? '';

  const list = all.filter((c) =>
    (!q || `${c.title} ${c.subtitle ?? ''} ${c.description ?? ''}`.toLowerCase().includes(q))
    && (!level || c.level === level)
    && (!cat || c.category === cat));

  const cats = [...new Set(all.map((c) => c.category).filter(Boolean))] as string[];
  const chip = (label: string, key: 'level' | 'cat', val: string, on: boolean) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (key === 'level' ? !on : level) p.set('level', key === 'level' ? val : level);
    if (key === 'cat' ? !on : cat) p.set('cat', key === 'cat' ? val : cat);
    return (
      <Link key={key + val} href={`/app/academy?${p.toString()}`} className={on ? 'chip on' : 'chip'}>
        {label}
      </Link>
    );
  };

  return (
    <>
      <h1 className="h1">Ακαδημία</h1>
      <p className="sub">Δομημένη διαδρομή. Κάθε ενότητα πατάει στην προηγούμενη.</p>

      <div className="chips2">
        {(['beginner', 'intermediate', 'advanced'] as Level[])
          .map((l) => chip(LEVEL_EL[l], 'level', l, level === l))}
        {cats.map((c) => chip(c, 'cat', c, cat === c))}
        {(q || level || cat) && <Link href="/app/academy" className="chip clear">Καθαρισμός</Link>}
      </div>

      {list.length === 0 ? (
        <div className="empty2" style={{ marginTop: 20 }}>
          <b>Δεν βρέθηκε μάθημα.</b>
          {q ? `Δοκίμασε άλλον όρο από το «${q}».` : 'Δοκίμασε άλλα φίλτρα.'}
        </div>
      ) : (
        <div className="grid g3" style={{ marginTop: 20 }}>
          {list.map((c) => (
            <Link key={c.id} href={`/app/academy/${c.slug}`}
                  className={`card2 course ${c.locked ? 'locked' : ''}`}>
              <div className="course-cover">
                {c.cover_url
                  /* eslint-disable-next-line @next/next/no-img-element */
                  ? <img src={c.cover_url} alt="" />
                  : <span className="course-mark">Apex<i>Hub</i></span>}
                {c.locked && <span className="lockpill"><ILock /></span>}
                {c.status === 'draft' && <span className="draftpill">Πρόχειρο</span>}
              </div>
              <div className="course-body">
                <b className="h2">
                  {c.title}{' '}
                  {c.title.startsWith('Δείγμα') && <span className="tagdemo">Δείγμα</span>}
                </b>
                {c.subtitle && <span className="course-sub">{c.subtitle}</span>}
                <span className="meta">
                  {LEVEL_EL[c.level]} · {c.lessons} μαθήματα{c.minutes ? ` · ${c.minutes}′` : ''}
                </span>
                <div className="bar"><span style={{ width: `${c.lessons ? (c.done / c.lessons) * 100 : 0}%` }} /></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
