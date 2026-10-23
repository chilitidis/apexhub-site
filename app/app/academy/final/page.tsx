import { redirect } from 'next/navigation';

/**
 * Η παλιά διεύθυνση του τελικού τεστ, όταν υπήρχε μόνο του Αρχάριου.
 * Μένει ζωντανή: υπάρχουν σύνδεσμοι σε μηνύματα και σελιδοδείκτες μελών.
 */
export default function FinalRedirect() {
  redirect('/app/academy/final/beginner');
}
