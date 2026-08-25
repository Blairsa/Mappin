export default function Constellation({ pins, tags, matchesFilter, onOpenPin, children }) {
  return (
    <div className="constellation">
      {children /* floating search/filter controls get mounted here by App.jsx */}
      {pins.map((p) => {
        const dimmed = !matchesFilter(p);
        const primary = tags[p.tags?.[0]] || { color: '#5F6368' };
        const visited = (p.rating || 0) > 0;
        const size = visited ? 16 + p.rating * 3 : 15;
        const style = {
          left: `${p.pos?.x ?? 50}%`,
          top: `${p.pos?.y ?? 50}%`,
          width: size,
          height: size,
          background: visited ? primary.color : '#fff',
          border: visited ? '3px solid #fff' : `2.5px solid ${primary.color}`,
        };
        return (
          <div key={p.id}>
            <div
              className={`pin-dot ${dimmed ? 'dim' : ''}`}
              style={style}
              title={p.name + (visited ? '' : ' (not visited yet)')}
              onClick={() => onOpenPin(p.id)}
            />
            <div className="pin-label" style={{ left: `${p.pos?.x ?? 50}%`, top: `${p.pos?.y ?? 50}%`, opacity: dimmed ? 0.18 : 1 }}>
              {p.name?.length > 16 ? p.name.slice(0, 15) + '…' : p.name}
            </div>
          </div>
        );
      })}
      <div className="map-legend">
        <span className="legend-item"><span className="legend-dot filled" />Visited</span>
        <span className="legend-item"><span className="legend-dot ring" />Not visited yet</span>
      </div>
    </div>
  );
}
