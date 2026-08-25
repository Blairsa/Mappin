import { useState } from 'react';
import { iconSvg } from '../lib/icons.jsx';

/** Flyout menu rendered by Rail.jsx when the brand icon is clicked. */
export default function MapPicker({ maps, currentMapId, onSwitch, onCreate }) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const submitCreate = () => {
    if (!newName.trim()) return;
    onCreate(newName.trim());
    setNewName('');
    setCreating(false);
  };

  return (
    <div className="map-flyout" onClick={(e) => e.stopPropagation()}>
      <div className="map-flyout-title">Your maps</div>
      {maps.map((m) => (
        <button
          key={m.id}
          className={`map-flyout-item ${m.id === currentMapId ? 'active' : ''}`}
          onClick={() => onSwitch(m.id)}
        >
          {m.id === currentMapId ? iconSvg('check') : <span style={{ width: 16 }} />}
          <span>{m.name}</span>
        </button>
      ))}
      <div className="divider" style={{ margin: '8px 0' }} />
      {!creating ? (
        <button className="map-flyout-item" onClick={() => setCreating(true)}>
          {iconSvg('add')}<span>New map</span>
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 6, padding: '4px 8px' }}>
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitCreate()}
            placeholder="Map name…"
            style={{ flex: 1, border: '1px solid var(--outline)', borderRadius: 8, padding: '6px 8px', fontSize: 13, fontFamily: 'inherit' }}
          />
          <button className="btn btn-tonal" style={{ padding: '6px 12px' }} onClick={submitCreate}>Add</button>
        </div>
      )}
    </div>
  );
}
