export default function Loading() {
  return (
    <>
      <div className="sk" style={{ width: 170, height: 26 }} />
      <div className="sk" style={{ width: 300, height: 15, marginTop: 10 }} />
      <div className="chips2">
        {[70, 82, 110, 96].map((w, i) => (
          <span key={i} className="sk" style={{ width: w, height: 30, borderRadius: 999 }} />
        ))}
      </div>
      <div className="grid g3" style={{ marginTop: 20 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card2" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="sk" style={{ aspectRatio: '16/9', borderRadius: 0 }} />
            <div style={{ padding: 14, display: 'grid', gap: 9 }}>
              <div className="sk" style={{ width: '70%', height: 15 }} />
              <div className="sk" style={{ width: '45%', height: 11 }} />
              <div className="sk" style={{ height: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
