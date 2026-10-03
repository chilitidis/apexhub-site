'use client';

import { useEffect } from 'react';
import { startPeak } from './peak-scene';

/**
 * Η 3D κορυφή πίσω από τον hero.
 *
 * Φορτώνεται μόνο στον browser (ο γονιός την περνάει από dynamic με
 * ssr:false): το three.js αγγίζει `document` και `window` στην αρχικοποίηση,
 * και ένα 500KB bundle δεν έχει καμία δουλειά στο server render μιας
 * σελίδας που πρέπει να εμφανίσει κείμενο αμέσως.
 *
 * Αν λείπει το WebGL, η startPeak γυρίζει αμέσως και ο καμβάς μένει στο
 * opacity:0 που του δίνει το CSS — φαίνεται το gradient και η σελίδα
 * δουλεύει κανονικά.
 */
export default function Peak() {
  useEffect(() => startPeak(), []);

  return (
    <>
      <div id="sceneWrap" aria-hidden>
        <canvas id="scene" />
      </div>
      <div id="dim" aria-hidden />
    </>
  );
}
