import 'server-only';
import { cookies } from 'next/headers';
import { asLang, LANG_COOKIE, type Lang } from './i18n';

/** Η γλώσσα του τρέχοντος αιτήματος. Για server components και routes. */
export function currentLang(): Lang {
  try {
    return asLang(cookies().get(LANG_COOKIE)?.value);
  } catch {
    return 'el';
  }
}
