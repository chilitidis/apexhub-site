'use client';

import { useState } from 'react';

/**
 * Αλλαγή σειράς με σύρσιμο.
 *
 * Με τα εγγενή drag events του browser, χωρίς βιβλιοθήκη: η λίστα είναι
 * κατακόρυφη, τα στοιχεία λίγα, και μια βιβλιοθήκη 40KB για να μετακινείς
 * γραμμές δεν αξίζει τον χρόνο φόρτωσης κάθε σελίδας.
 *
 * ΚΑΙ ΜΕ ΠΛΗΚΤΡΟΛΟΓΙΟ: το drag & drop δεν είναι προσβάσιμο από μόνο του.
 * Τα βελάκια δίπλα κάνουν την ίδια δουλειά για όποιον δεν σύρει.
 */
export default function Reorder({
  items, onSave,
}: {
  items: Array<{ id: string; label: string }>;
  onSave: (ids: string[]) => Promise<void>;
}) {
  const [list, setList] = useState(items);
  const [drag, setDrag] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= list.length || from === to) return;
    const next = [...list];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    setList(next);
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try { await onSave(list.map((i) => i.id)); setDirty(false); }
    finally { setSaving(false); }
  };

  return (
    <div className="reorder">
      <ol>
        {list.map((it, i) => (
          <li key={it.id}
              draggable
              onDragStart={() => setDrag(i)}
              onDragOver={(e) => { e.preventDefault(); if (drag !== null && drag !== i) { move(drag, i); setDrag(i); } }}
              onDragEnd={() => setDrag(null)}
              className={drag === i ? 'dragging' : ''}>
            <span className="grip" aria-hidden>⠿</span>
            <span className="rl">{it.label}</span>
            <span className="arrows">
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Πάνω">↑</button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === list.length - 1} aria-label="Κάτω">↓</button>
            </span>
          </li>
        ))}
      </ol>
      {dirty && (
        <button className="btn btn-solid btn-sm" onClick={save} disabled={saving} type="button">
          {saving ? 'Αποθήκευση…' : 'Αποθήκευση σειράς'}
        </button>
      )}
    </div>
  );
}
