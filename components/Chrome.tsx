'use client';

import { useEffect } from 'react';

/**
 * Ό,τι κάνει τη σελίδα να «ζει» έξω από τη 3D σκηνή: ο κόκκος του φιλμ, το
 * rail που γεμίζει και φωτίζει την ενότητα που διαβάζεις, τα reveal, τα
 * magnetic κουμπιά και το φως που ακολουθεί τον κέρσορα στις κάρτες.
 *
 * Όλα είναι διακριτικά επειδή συμβαίνουν πολλές φορές. Με reduced-motion
 * δεν τρέχει τίποτα από αυτά — το περιεχόμενο είναι ήδη ορατό από το CSS.
 */
export default function Chrome() {
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const off: Array<() => void> = [];

    /* ── ο κόκκος ─────────────────────────────────────────────────────
       Ζωγραφίζεται σε μισή ανάλυση και τεντώνεται: σε πλήρη ανάλυση ο
       θόρυβος είναι τόσο λεπτός που εξαφανίζεται, και κοστίζει τετραπλάσια. */
    const grain = document.getElementById('grain') as HTMLCanvasElement | null;
    let gt: ReturnType<typeof setTimeout>;
    if (grain) {
      const paint = () => {
        const w = (grain.width = Math.ceil(window.innerWidth / 2));
        const h = (grain.height = Math.ceil(window.innerHeight / 2));
        const x = grain.getContext('2d');
        if (!x) return;
        const img = x.createImageData(w, h);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const v = (Math.random() * 255) | 0;
          d[i] = d[i + 1] = d[i + 2] = v;
          d[i + 3] = 26;
        }
        x.putImageData(img, 0, 0);
        grain.style.width = '100%';
        grain.style.height = '100%';
      };
      paint();
      const onResize = () => { clearTimeout(gt); gt = setTimeout(paint, 250); };
      window.addEventListener('resize', onResize);
      off.push(() => { clearTimeout(gt); window.removeEventListener('resize', onResize); });
    }

    /* ── το rail γεμίζει με το scroll ─────────────────────────────────── */
    const fill = document.getElementById('railfill');
    if (fill) {
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        fill.style.height = p * 100 + '%';
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      off.push(() => window.removeEventListener('scroll', onScroll));
    }

    /* ── reveal ───────────────────────────────────────────────────────── */
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-rev]'));
    if (!reduce && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const el = e.target as HTMLElement;
            const sibs = el.parentElement
              ? Array.from(el.parentElement.querySelectorAll('[data-rev]'))
              : [];
            const idx = Math.max(0, sibs.indexOf(el));
            el.style.transitionDelay = Math.min(idx, 5) * 60 + 'ms';
            el.classList.add('in');
            io.unobserve(el);
          });
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
      );
      items.forEach((el) => io.observe(el));
      off.push(() => io.disconnect());
    } else {
      items.forEach((el) => el.classList.add('in'));
    }

    /* ── το rail φωτίζει την ενότητα που βλέπεις ──────────────────────── */
    if ('IntersectionObserver' in window) {
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('#rail a'));
      const map = new Map<string, HTMLAnchorElement>();
      links.forEach((a) => {
        const href = a.getAttribute('href');
        if (href && document.querySelector(href)) map.set(href.slice(1), a);
      });
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            const a = map.get(e.target.id);
            if (a) a.classList.toggle('on', e.isIntersecting && e.intersectionRatio > 0.3);
          });
        },
        { threshold: [0, 0.3, 0.6] },
      );
      map.forEach((_a, id) => {
        const t = document.getElementById(id);
        if (t) io.observe(t);
      });
      off.push(() => io.disconnect());
    }

    if (fine && !reduce) {
      /* ── magnetic κουμπιά ───────────────────────────────────────────
         5px μέγιστη μετατόπιση. Πάνω από αυτό το κουμπί «ξεφεύγει» και ο
         χρήστης το κυνηγάει — η μαγνητική αίσθηση γίνεται εμπόδιο.
         Γράφεται σε custom properties, όχι σε inline transform, ώστε το
         :active να μπορεί ακόμη να προσθέσει το scale του. */
      document.querySelectorAll<HTMLElement>('.btn').forEach((b) => {
        let raf = 0, tx = 0, ty = 0;
        const move = (e: PointerEvent) => {
          const r = b.getBoundingClientRect();
          tx = ((e.clientX - r.left) / r.width - 0.5) * 10;
          ty = ((e.clientY - r.top) / r.height - 0.5) * 7;
          if (!raf)
            raf = requestAnimationFrame(() => {
              raf = 0;
              b.style.setProperty('--tx', tx.toFixed(2) + 'px');
              b.style.setProperty('--ty', ty.toFixed(2) + 'px');
            });
        };
        const leave = () => {
          b.style.removeProperty('--tx');
          b.style.removeProperty('--ty');
        };
        b.addEventListener('pointermove', move);
        b.addEventListener('pointerleave', leave);
        off.push(() => {
          b.removeEventListener('pointermove', move);
          b.removeEventListener('pointerleave', leave);
        });
      });

      /* ── spotlight στις κάρτες: μόνο φως, κανένα transform ─────────── */
      document
        .querySelectorAll<HTMLElement>('.pillar,.path,.voice,.item,.card')
        .forEach((c) => {
          let raf = 0, x = 0, y = 0;
          const move = (e: PointerEvent) => {
            const r = c.getBoundingClientRect();
            x = e.clientX - r.left;
            y = e.clientY - r.top;
            if (!raf)
              raf = requestAnimationFrame(() => {
                raf = 0;
                c.style.setProperty('--mx', x.toFixed(0) + 'px');
                c.style.setProperty('--my', y.toFixed(0) + 'px');
              });
          };
          const on = () => c.classList.add('lit');
          const offLit = () => c.classList.remove('lit');
          c.addEventListener('pointermove', move);
          c.addEventListener('pointerenter', on);
          c.addEventListener('pointerleave', offLit);
          off.push(() => {
            c.removeEventListener('pointermove', move);
            c.removeEventListener('pointerenter', on);
            c.removeEventListener('pointerleave', offLit);
          });
        });
    }

    return () => off.forEach((f) => f());
  }, []);

  return (
    <>
      <canvas id="grain" aria-hidden />
      <div id="rail" aria-hidden>
        <div className="line" />
        <div className="fill" id="railfill" />
        <div className="stops">
          <a href="#p1">Trading</a>
          <a href="#p2">Κοινότητα</a>
          <a href="#p3">Εκπαίδευση</a>
        </div>
      </div>
    </>
  );
}
