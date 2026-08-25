import { iconSvg } from '../lib/icons.jsx';

function Stars({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={i <= rating ? 'star-filled' : 'star-empty'}>
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

export default function PinGrid({ pins, tags, matchesFilter, onOpenPin, addedByLabel }) {
  if (!pins.length) {
    return <div style={{ color: 'var(--on-surface-var)', fontSize: 13.5, padding: '20px 22px' }}>No pins match your search.</div>;
  }
  return (
    <div className="grid">
      {pins.map((p) => {
        const dimmed = !matchesFilter(p);
        const primary = tags[p.tags?.[0]] || { color: 'var(--outline)' };
        return (
          <div key={p.id} className={`card ${dimmed ? 'dim' : ''}`}>
            <div className="card-bar" style={{ background: primary.color }} />
            <div className="card-body" onClick={() => onOpenPin(p.id)}>
              <div className="card-top">
                <h3>{p.name}</h3>
                {p.url && (
                  <button className="icon-btn" onClick={(e) => { e.stopPropagation(); window.open(p.url, '_blank'); }} title="Open link">
                    {iconSvg('link')}
                  </button>
                )}
              </div>
              <div className="card-addr">{p.address}</div>
              {p.rating > 0 ? <Stars rating={p.rating} /> : <span className="not-visited">Not visited yet</span>}
              <div className="tagchips">
                {p.tags?.map((k) => tags[k] && (
                  <span key={k} className="tagchip" style={{ background: tags[k].bg, color: tags[k].color }}>
                    {tags[k].emoji} {tags[k].label}
                  </span>
                ))}
              </div>
              {p.note && <div className="note">"{p.note}"</div>}
              <div className="card-foot">
                <div className="savedby">{addedByLabel(p.addedBy)}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
