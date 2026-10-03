import { redirect } from 'next/navigation';
/** Παλιά διαδρομή μαθήματος: στέλνει στον νέο κατάλογο. */
export default function Moved() { redirect('/app/academy'); }
