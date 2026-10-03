export default function Loading() {
  return (
    <>
      <div className="sk" style={{ width: 300, height: 26 }} />
      <div className="sk" style={{ height: 38, marginTop: 20, borderRadius: 9 }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="sk" style={{ height: 56, marginTop: 8, borderRadius: 11 }} />
      ))}
    </>
  );
}
