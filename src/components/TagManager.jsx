import { useState } from 'react';
import { iconSvg } from '../lib/icons.jsx';

const COLOR_SWATCHES = ['#EA4335','#D93069','#5E35B1','#3F51B5','#1A73E8','#12B5CB','#009688','#188038','#7CB342','#F9AB00','#FB8C00','#6D4C41'];
const EMOJI_SWATCHES = ['🥾','🍽️','☕','🍸','🍷','🎁','🏖️','🏔️','🌙','🚗','📍','🏨'];

export default function TagManager({ open, onClose, tags, pins, onUpdateTags }) {
  const [editingKey, setEditingKey] = useState(null);
  if (!open) return null;

  const setStyle = (key, changes) => onUpdateTags({ ...tags, [key]: { ...tags[key], ...changes } });

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2>{editingKey ? `Style for "${tags[editingKey].label}"` : 'Tag manager'}</h2>
          <button className="icon-btn" onClick={editingKey ? () => setEditingKey(null) : onClose}>{iconSvg('close')}</button>
        </div>
        <div className="modal-body">
          {!editingKey && Object.entries(tags).map(([key, t]) => (
            <div key={key} className="tag-row">
              <div className="tag-swatch" style={{ background: t.bg }}>{t.emoji}</div>
              <div className="name">{t.label}</div>
              <div className="count">{pins.filter((p) => p.tags?.includes(key)).length} pins</div>
              <button className="icon-btn" onClick={() => setEditingKey(key)}>{iconSvg('edit')}</button>
            </div>
          ))}

          {editingKey && (
            <>
              <div style={{ fontSize: 12.5, color: 'var(--on-surface-var)', marginBottom: 8 }}>Colour</div>
              <div className="style-grid">
                {COLOR_SWATCHES.map((c) => (
                  <div key={c} className={`style-swatch ${tags[editingKey].color === c ? 'sel' : ''}`} style={{ background: c }}
                    onClick={() => setStyle(editingKey, { color: c })} />
                ))}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--on-surface-var)', margin: '14px 0 8px' }}>Icon</div>
              <div className="style-grid">
                {EMOJI_SWATCHES.map((e) => (
                  <div key={e} className={`style-swatch ${tags[editingKey].emoji === e ? 'sel' : ''}`}
                    style={{ background: 'var(--surface-var)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
                    onClick={() => setStyle(editingKey, { emoji: e })}>{e}</div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={editingKey ? () => setEditingKey(null) : onClose}>
            {editingKey ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
