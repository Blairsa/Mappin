import { useState } from 'react';

export default function MapSwitcher({ maps, currentMapId, onSwitch, onCreate }) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const submitCreate = () => {
    if (!newName.trim()) return;
    onCreate(newName.trim());
    setNewName('');
    setCreating(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <select
        value={currentMapId || ''}
        onChange={(e) => onSwitch(e.target.value)}
        style={{ border: '1px solid var(--outline)', borderRadius: 10, padding: '8px 10px', fontSize: 13.5, fontFamily: 'inherit', background: 'var(--surface)' }}
      >
        {maps.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>

      {!creating ? (
        <button className="btn-text" onClick={() => setCreating(true)}>+ New map</button>
      ) : (
        <>
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitCreate()}
            placeholder="Map name…"
            style={{ border: '1px solid var(--outline)', borderRadius: 10, padding: '7px 10px', fontSize: 13.5, fontFamily: 'inherit' }}
          />
          <button className="btn btn-tonal" onClick={submitCreate}>Create</button>
          <button className="btn-text" onClick={() => setCreating(false)}>Cancel</button>
        </>
      )}
    </div>
  );
}
