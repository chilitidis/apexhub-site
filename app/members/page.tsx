import { redirect } from 'next/navigation';
/** Η περιοχή μελών μετακόμισε στο /app. Ο παλιός σύνδεσμος δεν σπάει. */
export default function Moved() { redirect('/app'); }
