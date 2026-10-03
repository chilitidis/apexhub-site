'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ICheck } from './Icons';

/**
 * Σήμανση ολοκλήρωσης.
 *
 * Αισιόδοξη ενημέρωση: το κουμπί αλλάζει αμέσως και διορθώνεται μόνο αν ο
 * server διαφωνήσει. Το ίδιο κλικ δέκα φορές την ημέρα δεν πρέπει να περιμένει
 * ταξίδι στο δίκτυο για να δείξει ότι το άκουσε.
 */
export default function DoneButton({ lessonId, done }: { lessonId: string; done: boolean }) {
  const [on, setOn] = useState(done);
  const [pending, start] = useTransition();
  const router = useRouter();

  const toggle = async () => {
    const want = !on;
    setOn(want);
    try {
      const r = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lessonId, done: want }),
      });
      if (!r.ok) throw new Error();
      start(() => router.refresh());
    } catch {
      setOn(!want);
    }
  };

  return (
    <button className={on ? 'donebtn on' : 'donebtn'} onClick={toggle} disabled={pending} type="button">
      <ICheck /> {on ? 'Ολοκληρώθηκε' : 'Σήμανση ως ολοκληρωμένο'}
    </button>
  );
}
