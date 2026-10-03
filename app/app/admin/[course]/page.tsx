import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import Reorder from '@/components/Reorder';
import {
  saveCourse, deleteCourse, createModule, saveModule, deleteModule,
  createLesson, saveLesson, deleteLesson, deleteFile, setAccess, reorder,
} from '../actions';

export const dynamic = 'force-dynamic';

type Course = {
  id: string; slug: string; title: string; subtitle: string | null; description: string | null;
  cover_url: string | null; level: string; category: string | null; status: string;
};
type Mod = { id: string; title: string; summary: string | null; sort: number; status: string };
type Les = {
  id: string; module_id: string; slug: string; title: string; summary: string | null;
  body: string | null; vimeo_id: string | null; duration_sec: number | null;
  sort: number; status: string; is_free: boolean;
};
type Tier = { id: string; slug: string; name: string };
type FileRow = { id: string; lesson_id: string; name: string; url: string };

/** Οι επιλογές πακέτων για ένα στοιχείο — ίδιο σχήμα σε course/module/lesson. */
function AccessBox({
  scope, targetId, courseId, tiers, chosen,
}: { scope: string; targetId: string; courseId: string; tiers: Tier[]; chosen: Set<string> }) {
  return (
    <form action={setAccess} className="acc">
      <input type="hidden" name="scope" value={scope} />
      <input type="hidden" name="target_id" value={targetId} />
      <input type="hidden" name="course_id" value={courseId} />
      <span className="acc-l">Πρόσβαση</span>
      {tiers.map((t) => (
        <label key={t.id}>
          <input type="checkbox" name="tier" value={t.id} defaultChecked={chosen.has(t.id)} />
          {t.name}
        </label>
      ))}
      <button className="mini" type="submit">Αποθήκευση</button>
      {chosen.size === 0 && <em className="meta">Κανένα επιλεγμένο = ανοιχτό σε όλους</em>}
    </form>
  );
}

export default async function CourseEditor({ params }: { params: { course: string } }) {
  await requireAdmin();
  const id = params.course;

  const [{ data: c }, { data: mods }, { data: les }, { data: tiersRaw }, { data: acc }, { data: files }] =
    await Promise.all([
      db().from('courses').select('*').eq('id', id).maybeSingle(),
      db().from('modules').select('*').eq('course_id', id).order('sort'),
      db().from('lessons').select('*').eq('course_id', id).order('sort'),
      db().from('access_tiers').select('*').order('rank'),
      db().from('content_access').select('*'),
      db().from('lesson_files').select('*').order('sort'),
    ]);

  if (!c) notFound();
  const course = c as unknown as Course;
  const modules = (mods ?? []) as unknown as Mod[];
  const lessons = (les ?? []) as unknown as Les[];
  const tiers = (tiersRaw ?? []) as unknown as Tier[];
  const allFiles = (files ?? []) as unknown as FileRow[];

  const chosenFor = (scope: string, target: string) => {
    const s = new Set<string>();
    for (const a of (acc ?? []) as Array<{ scope: string; target_id: string; tier_id: string }>) {
      if (a.scope === scope && a.target_id === target) s.add(a.tier_id);
    }
    return s;
  };

  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="h1">{course.title}</h1>
          <p className="sub">
            <Link href="/app/admin">← Όλα τα μαθήματα</Link>
            {course.status === 'published' && (
              <> · <Link href={`/app/academy/${course.slug}`}>Δες το ως μέλος</Link></>
            )}
          </p>
        </div>
        <form action={deleteCourse}>
          <input type="hidden" name="id" value={course.id} />
          <button className="danger" type="submit">Διαγραφή μαθήματος</button>
        </form>
      </div>

      {/* ── στοιχεία μαθήματος ─────────────────────────────────────── */}
      <form action={saveCourse} className="card2 fm">
        <input type="hidden" name="id" value={course.id} />
        <div className="fm-grid">
          <label>Τίτλος<input name="title" defaultValue={course.title} required /></label>
          <label>Υπότιτλος<input name="subtitle" defaultValue={course.subtitle ?? ''} /></label>
          <label>Διεύθυνση (slug)<input name="slug" defaultValue={course.slug} /></label>
          <label>Κατηγορία<input name="category" defaultValue={course.category ?? ''} /></label>
          <label>Επίπεδο
            <select name="level" defaultValue={course.level}>
              <option value="beginner">Αρχάριος</option>
              <option value="intermediate">Μεσαίος</option>
              <option value="advanced">Προχωρημένος</option>
            </select>
          </label>
          <label>Κατάσταση
            <select name="status" defaultValue={course.status}>
              <option value="draft">Πρόχειρο</option>
              <option value="published">Δημοσιευμένο</option>
            </select>
          </label>
        </div>
        <label>Περιγραφή<textarea name="description" rows={3} defaultValue={course.description ?? ''} /></label>
        <label className="fm-file">
          Εξώφυλλο
          <input type="file" name="cover" accept="image/*" />
          {course.cover_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img className="fm-cover" src={course.cover_url} alt="" />
          )}
        </label>
        <button className="btn btn-solid btn-sm" type="submit">Αποθήκευση</button>
      </form>

      <AccessBox scope="course" targetId={course.id} courseId={course.id}
                 tiers={tiers} chosen={chosenFor('course', course.id)} />

      {/* ── σειρά ενοτήτων ─────────────────────────────────────────── */}
      {modules.length > 1 && (
        <div className="sec">
          <div className="sec-top"><h2>Σειρά ενοτήτων</h2></div>
          <Reorder
            items={modules.map((m) => ({ id: m.id, label: m.title }))}
            onSave={async (ids) => { 'use server'; await reorder('modules', ids, course.id); }}
          />
        </div>
      )}

      {/* ── ενότητες ───────────────────────────────────────────────── */}
      <div className="sec">
        <div className="sec-top"><h2>Ενότητες</h2></div>

        {modules.map((m) => {
          const items = lessons.filter((l) => l.module_id === m.id);
          return (
            <details key={m.id} className="adm-mod">
              <summary>
                <b>{m.title}</b>
                <span className="meta">{items.length} lessons</span>
                <span className={`pill ${m.status}`}>{m.status === 'published' ? 'Ορατή' : 'Πρόχειρη'}</span>
              </summary>

              <form action={saveModule} className="fm">
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="course_id" value={course.id} />
                <div className="fm-grid">
                  <label>Τίτλος<input name="title" defaultValue={m.title} /></label>
                  <label>Κατάσταση
                    <select name="status" defaultValue={m.status}>
                      <option value="published">Ορατή</option>
                      <option value="draft">Πρόχειρη</option>
                    </select>
                  </label>
                </div>
                <label>Περίληψη<input name="summary" defaultValue={m.summary ?? ''} /></label>
                <div className="fm-row">
                  <button className="mini" type="submit">Αποθήκευση</button>
                </div>
              </form>

              <AccessBox scope="module" targetId={m.id} courseId={course.id}
                         tiers={tiers} chosen={chosenFor('module', m.id)} />

              {items.length > 1 && (
                <Reorder
                  items={items.map((l) => ({ id: l.id, label: l.title }))}
                  onSave={async (ids) => { 'use server'; await reorder('lessons', ids, course.id); }}
                />
              )}

              {items.map((l) => (
                <details key={l.id} className="adm-les">
                  <summary>
                    <span>{l.title}</span>
                    {l.is_free && <span className="pill free">Ανοιχτό</span>}
                    <span className={`pill ${l.status}`}>{l.status === 'published' ? 'Δημοσιευμένο' : 'Πρόχειρο'}</span>
                  </summary>

                  <form action={saveLesson} className="fm">
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="course_id" value={course.id} />
                    <div className="fm-grid">
                      <label>Τίτλος<input name="title" defaultValue={l.title} /></label>
                      <label>Διεύθυνση (slug)<input name="slug" defaultValue={l.slug} /></label>
                      <label>Vimeo (σύνδεσμος ή ID)
                        <input name="vimeo" defaultValue={l.vimeo_id ?? ''} placeholder="https://vimeo.com/123456789" />
                      </label>
                      <label>Διάρκεια (λεπτά)
                        <input name="minutes" type="number" min={0}
                               defaultValue={l.duration_sec ? Math.round(l.duration_sec / 60) : ''} />
                      </label>
                      <label>Κατάσταση
                        <select name="status" defaultValue={l.status}>
                          <option value="draft">Πρόχειρο</option>
                          <option value="published">Δημοσιευμένο</option>
                        </select>
                      </label>
                      <label className="chk">
                        <input type="checkbox" name="is_free" defaultChecked={l.is_free} />
                        Ανοιχτό σε κάθε μέλος
                      </label>
                    </div>
                    <label>Περίληψη<input name="summary" defaultValue={l.summary ?? ''} /></label>
                    <label>Κείμενο<textarea name="body" rows={4} defaultValue={l.body ?? ''} /></label>
                    <label className="fm-file">Αρχείο<input type="file" name="file" /></label>
                    <div className="fm-row">
                      <button className="mini" type="submit">Αποθήκευση</button>
                    </div>
                  </form>

                  {allFiles.filter((f) => f.lesson_id === l.id).map((f) => (
                    <form key={f.id} action={deleteFile} className="fm-row filerow">
                      <input type="hidden" name="id" value={f.id} />
                      <input type="hidden" name="course_id" value={course.id} />
                      <a href={f.url} target="_blank" rel="noopener">{f.name}</a>
                      <button className="danger mini" type="submit">Αφαίρεση</button>
                    </form>
                  ))}

                  <AccessBox scope="lesson" targetId={l.id} courseId={course.id}
                             tiers={tiers} chosen={chosenFor('lesson', l.id)} />

                  <form action={deleteLesson} className="fm-row">
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="course_id" value={course.id} />
                    <button className="danger mini" type="submit">Διαγραφή lesson</button>
                  </form>
                </details>
              ))}

              <form action={createLesson} className="adm-new sm">
                <input type="hidden" name="module_id" value={m.id} />
                <input type="hidden" name="course_id" value={course.id} />
                <input name="title" placeholder="Τίτλος νέου lesson" required />
                <button className="mini" type="submit">Προσθήκη</button>
              </form>

              <form action={deleteModule} className="fm-row">
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="course_id" value={course.id} />
                <button className="danger mini" type="submit">Διαγραφή ενότητας</button>
              </form>
            </details>
          );
        })}

        <form action={createModule} className="adm-new">
          <input type="hidden" name="course_id" value={course.id} />
          <input name="title" placeholder="Τίτλος νέας ενότητας" required />
          <button className="btn btn-solid btn-sm" type="submit">Προσθήκη ενότητας</button>
        </form>
      </div>
    </>
  );
}
