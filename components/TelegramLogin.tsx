'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Το επίσημο Telegram Login Widget.
 *
 * Δεν γίνεται να το φτιάξουμε μόνοι μας: την υπογραφή την παράγει το Telegram,
 * μέσα σε δικό του iframe. Εμείς φορτώνουμε το script του και του λέμε πού να
 * στείλει τον χρήστη μετά.
 *
 * ΠΡΟΫΠΟΘΕΣΗ ΠΟΥ ΑΠΟΤΥΓΧΑΝΕΙ ΣΙΩΠΗΛΑ: στο @BotFather πρέπει να έχει γίνει
 * /setdomain → apexhub.gr. Χωρίς αυτό το κουμπί απλά δεν εμφανίζεται ποτέ,
 * χωρίς κανένα μήνυμα. Γι' αυτό δείχνουμε δική μας εξήγηση αν αργήσει.
 */
export default function TelegramLogin({ bot, authUrl, lang = 'el' }: { bot: string; authUrl: string; lang?: 'el' | 'en' }) {
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (started.current || !ref.current) return;
    started.current = true;

    const s = document.createElement('script');
    s.src = 'https://telegram.org/js/telegram-widget.js?22';
    s.async = true;
    s.setAttribute('data-telegram-login', bot);
    s.setAttribute('data-size', 'large');
    s.setAttribute('data-radius', '20');
    s.setAttribute('data-userpic', 'false');
    s.setAttribute('data-auth-url', authUrl);
    s.setAttribute('data-lang', lang);
    ref.current.appendChild(s);

    const t = setTimeout(() => {
      if (!ref.current?.querySelector('iframe')) setStuck(true);
    }, 6000);
    return () => clearTimeout(t);
  }, [bot, authUrl, lang]);

  return (
    <div>
      <div ref={ref} style={{ minHeight: 48 }} />
      {stuck && (
        <p className="note" style={{ marginTop: 14 }}>
          {lang === 'en'
            ? 'The Telegram button did not load. This is usually caused by an ad blocker or very strict privacy settings. Try another browser.'
            : 'Το κουμπί του Telegram δεν φόρτωσε. Συνήθως φταίει ένας αποκλειστής διαφημίσεων ή πολύ αυστηρές ρυθμίσεις απορρήτου. Δοκίμασε άλλο πρόγραμμα περιήγησης.'}
        </p>
      )}
    </div>
  );
}
