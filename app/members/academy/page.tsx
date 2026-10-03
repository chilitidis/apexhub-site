import { redirect } from 'next/navigation';
/** Παλιά διαδρομή. Η ακαδημία ζει πλέον στο /app/academy. */
export default function Moved() { redirect('/app/academy'); }
