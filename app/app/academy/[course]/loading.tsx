export default function Loading() {
  return (
    <>
      <div className="sk" style={{ width: 280, height: 26 }} />
      <div className="sk" style={{ width: 340, height: 15, marginTop: 10 }} />
      <div className="sk" style={{ height: 66, marginTop: 18, borderRadius: 14 }} />
      <div className="sec">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="sk" style={{ height: 54, marginBottom: 10, borderRadius: 12 }} />
        ))}
      </div>
    </>
  );
}
