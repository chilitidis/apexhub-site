/**
 * Μόνο το όνομα του cookie, σε δικό του αρχείο.
 *
 * Το middleware τρέχει σε Edge runtime, όπου δεν υπάρχει το `crypto` του Node.
 * Όταν εισήγαγε τη σταθερά από το lib/session.ts, τραβούσε μαζί ΟΛΟ το αρχείο
 * — και μαζί του το crypto — φουσκώνοντας το middleware και γεμίζοντας το
 * build με προειδοποιήσεις. Μια σταθερά σε δικό της αρχείο λύνει και τα δύο.
 */
export const SESSION_COOKIE = 'apex_session';
