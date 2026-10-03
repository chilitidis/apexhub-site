export default function Loading() {
  return (
    <div className="lesson2">
      <div className="lesson2-main">
        <div className="sk" style={{ width: 300, height: 26 }} />
        <div className="sk" style={{ width: 380, height: 15, marginTop: 10 }} />
        <div className="sk" style={{ aspectRatio: '16/9', marginTop: 18, borderRadius: 12 }} />
        <div className="sk" style={{ height: 13, marginTop: 22, width: '92%' }} />
        <div className="sk" style={{ height: 13, marginTop: 9, width: '84%' }} />
      </div>
      <aside className="lesson2-side">
        <div className="sk" style={{ width: 110, height: 12 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="sk" style={{ height: 34, marginTop: 8, borderRadius: 9 }} />
        ))}
      </aside>
    </div>
  );
}
