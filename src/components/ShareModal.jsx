import { useState } from 'react';
import { iconSvg } from '../lib/icons.jsx';

export default function ShareModal({ open, onClose, mapDoc, onAddCollaborator, onRemoveCollaborator }) {
  const [email, setEmail] = useState('');
  if (!open) return null;

  const submit = () => {
    if (!email.trim()) return;
    onAddCollaborator(email.trim());
    setEmail('');
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2>Share "{mapDoc?.name || 'this map'}"</h2>
          <button className="icon-btn" onClick={onClose}>{iconSvg('close')}</button>
        </div>
        <div className="modal-body">
          <div className="field" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Add someone by email…" onKeyDown={(e) => e.key === 'Enter' && submit()} />
            <button className="btn btn-tonal" onClick={submit}>Add</button>
          </div>
          <div className="divider" />
          {(mapDoc?.memberEmails || []).map((em) => (
            <div key={em} className="person-row">
              <div className="avatar" style={{ background: 'var(--blue)' }}>{em[0]?.toUpperCase()}</div>
              <div><div className="name">{em}</div><div className="email">{em === mapDoc.ownerEmail ? 'Owner' : 'Collaborator'}</div></div>
              {em !== mapDoc.ownerEmail && (
                <button className="btn-text" style={{ marginLeft: 'auto' }} onClick={() => onRemoveCollaborator(em)}>Remove</button>
              )}
            </div>
          ))}
          <div className="oembed-hint" style={{ marginTop: 12 }}>
            They'll need to sign in with this exact Google account for access to unlock —
            Firestore rules check their signed-in email against this list.
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
