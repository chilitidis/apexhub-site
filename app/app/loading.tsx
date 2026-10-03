/**
 * Τι βλέπεις όσο φορτώνει.
 *
 * Σκελετός με το ΣΧΗΜΑ του περιεχομένου που έρχεται, όχι spinner: ο χρήστης
 * καταλαβαίνει τι θα δει και η σελίδα δεν «πηδάει» όταν φτάσουν τα δεδομένα.
 */
export default function Loading() {
  return (
    <>
      <div className="sk" style={{ width: 240, height: 26 }} />
      <div className="sk" style={{ width: 320, height: 15, marginTop: 10 }} />
      <div className="sec">
        <div className="sk" style={{ width: 90, height: 12 }} />
        <div className="sk" style={{ height: 74, marginTop: 12, borderRadius: 14 }} />
      </div>
      <div className="sec">
        <div className="sk" style={{ width: 120, height: 12 }} />
        <div className="sk" style={{ height: 88, marginTop: 12, borderRadius: 14 }} />
      </div>
    </>
  );
}
