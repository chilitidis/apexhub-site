import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { LEVEL_EL, type Level } from '@/lib/academy';
import { createCourse } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  await requireAdmin();

  const { data } = await db().from('courses').select('*').order('sort');
  const courses = (data ?? []) as Array<{
    id: string; title: string; slug: string; level: Level; status: string; category: string | null;
  }>;

  const { data: counts } = await db().from('lessons').select('course_id');
  const per = new Map<string, number>();
  for (const r of (counts ?? []) as Array<{ course_id: string }>) {
    per.set(r.course_id, (per.get(r.course_id) ?? 0) + 1);
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="h1">Διαχείριση περιεχομένου</h1>
          <p className="sub">Μαθήματα, ενότητες και lessons. Ό,τι αλλάζεις εδώ, το βλέπουν τα μέλη.</p>
        </div>
        <Link className="btn btn-line btn-sm" href="/app/admin/tiers">Πακέτα πρόσβασης</Link>
      </div>

      <form action={createCourse} className="adm-new">
        <input name="title" placeholder="Τίτλος νέου μαθήματος" aria-label="Τίτλος" required />
        <button className="btn btn-solid btn-sm" type="submit">Δημιουργία</button>
      </form>

      {courses.length === 0 ? (
        <div className="empty2" style={{ marginTop: 20 }}>
          <b>Δεν υπάρχει κανένα μάθημα.</b>Φτιάξε το πρώτο από πάνω.
        </div>
      ) : (
        <ul className="adm-list">
          {courses.map((c) => (
            <li key={c.id}>
              <Link href={`/app/admin/${c.id}`}>
                <span className="adm-t">
                  <b>{c.title}</b>
                  <em>{LEVEL_EL[c.level]}{c.category ? ` · ${c.category}` : ''} · {per.get(c.id) ?? 0} lessons</em>
                </span>
                <span className={`pill ${c.status}`}>
                  {c.status === 'published' ? 'Δημοσιευμένο' : 'Πρόχειρο'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
