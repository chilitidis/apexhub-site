import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { findLesson, neighbours, allLessons } from '@/lib/academy';
import { DoneToggle } from '@/components/Progress';

export const dynamic = 'force-dynamic';

export function generateMetadata({ params }: { params: { lesson: string } }): Metadata {
  const f = findLesson(params.lesson);
  return {
    title: f ? `${f.lesson.title} — APEXHUB` : 'Μάθημα — APEXHUB',
    robots: { index: false, follow: false },
  };
}

export function generateStaticParams() {
  return allLessons().map((l) => ({ lesson: l.slug }));
}

export default function LessonPage({ params }: { params: { lesson: string } }) {
  if (!currentSession()) redirect('/login');

  const f = findLesson(params.lesson);
  if (!f) notFound();

  const { prev, next } = neighbours(params.lesson);

  return (
    <main className="wrap lesson">
      <nav className="crumbs">
        <a href="/members/academy">Ακαδημία</a>
        <span>/</span>
        <span>{f.section.title}</span>
      </nav>

      <h1>{f.lesson.title}</h1>
      <p className="lede">{f.lesson.summary}</p>

      {f.lesson.video ? (
        <div className="player">
          <iframe
            src={f.lesson.video}
            title={f.lesson.title}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        /* Κενή κατάσταση που λέει την αλήθεια. Ένα «σύντομα κοντά σας» χωρίς
           περιεχόμενο είναι χειρότερο από το να μην υπάρχει η σελίδα. */
        <div className="empty">
          <h3>Το μάθημα δεν έχει ανέβει ακόμη.</h3>
          <p>
            Η ύλη γράφεται και γυρίζεται με σειρά. Μέχρι να ανέβει αυτό, η
            δουλειά της ημέρας γίνεται στο Telegram — εκεί απαντιούνται και οι
            απορίες πάνω σε ό,τι διαβάζεις εδώ.
          </p>
          <a className="btn btn-line btn-sm" href="https://t.me/ApexHubChannel"
             target="_blank" rel="noopener">Άνοιγμα στο Telegram</a>
        </div>
      )}

      <div className="lesson-foot">
        <DoneToggle slug={f.lesson.slug} />
      </div>

      <div className="pager">
        {prev ? (
          <a href={`/members/academy/${prev.slug}`}>
            <span>Προηγούμενο</span><b>{prev.title}</b>
          </a>
        ) : <span />}
        {next ? (
          <a className="nx" href={`/members/academy/${next.slug}`}>
            <span>Επόμενο</span><b>{next.title}</b>
          </a>
        ) : <span />}
      </div>
    </main>
  );
}
