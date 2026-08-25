import { useEffect, useState } from 'react';
import { iconSvg } from '../lib/icons.jsx';
import { enrichFromUrl } from '../lib/oembed.js';
import AddressAutocomplete from './AddressAutocomplete.jsx';

export default function PinModal({ open, onClose, onSave, tags, initial }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [placeId, setPlaceId] = useState(null);
  const [geo, setGeo] = useState(null);
  const [note, setNote] = useState('');
  const [url, setUrl] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [oembedHint, setOembedHint] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name || '');
    setAddress(initial?.address || '');
    setPlaceId(initial?.placeId || null);
    setGeo(initial?.geo || null);
    setNote(initial?.note || '');
    setUrl(initial?.url || '');
    setRating(initial?.rating || 0);
    setSelectedTags(initial?.tags || []);
    setOembedHint('');
    setSaveError(null);
  }, [open, initial]);

  if (!open) return null;

  const toggleTag = (key) =>
    setSelectedTags((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const handleFetch = async () => {
    if (!url) return;
    setFetching(true);
    const result = await enrichFromUrl(url);
    setFetching(false);
    if (result.supported) {
      if (!name) setName(result.title || name);
      setOembedHint(`Pulled from ${result.platform}: "${result.title}" — you may still want to tidy the name.`);
    } else {
      setOembedHint(result.reason);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      // onSave (App.jsx) writes to Firestore and only resolves on success —
      // previously this call wasn't awaited or caught, so any write failure
      // (permissions, network, etc.) vanished as an unhandled rejection and
      // the form just sat there with no feedback. Now it's actually surfaced.
      await onSave({ name: name.trim(), address, placeId, geo, note: note.trim(), url: url.trim(), rating, tags: selectedTags });
    } catch (err) {
      setSaveError(err.message || 'Something went wrong saving this pin — check your Firestore rules and connection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2>{initial ? 'Edit pin' : 'Add a pin'}</h2>
          <button className="icon-btn" onClick={onClose}>{iconSvg('close')}</button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Name</label>
            <AddressAutocomplete onSelect={({ name: pName, address: pAddr, placeId: pid, lat, lng }) => {
              setName(pName);
              setAddress(pAddr);
              setPlaceId(pid);
              setGeo(lat != null && lng != null ? { lat, lng } : null);
            }} />
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Or type a custom name…" style={{ marginTop: 8 }}
            />
            {address && <div className="oembed-hint">Address: {address}</div>}
          </div>
          <div className="field">
            <label>Your rating</label>
            <div className="star-picker">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} viewBox="0 0 24 24" className={i <= rating ? 'star-filled' : 'star-empty'}
                  onClick={() => setRating(rating === i ? 0 : i)}>
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
              {rating === 0 && <span className="not-visited">Not visited yet</span>}
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why you're saving this, how it went, anything to remember…"
            />
          </div>
          <div className="field">
            <label>Tags</label>
            <div className="tagchips">
              {Object.entries(tags).map(([key, t]) => {
                const sel = selectedTags.includes(key);
                return (
                  <span key={key} className="tagchip" style={{ background: sel ? t.color : t.bg, color: sel ? '#fff' : t.color, cursor: 'pointer' }}
                    onClick={() => toggleTag(key)}>
                    {t.emoji} {t.label}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="field">
            <label>Link (booking, menu, TikTok/YouTube/Instagram post…)</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            <button className="btn-text" style={{ padding: '6px 0' }} onClick={handleFetch} disabled={!url || fetching}>
              {fetching ? 'Fetching…' : 'Fetch details from link'}
            </button>
            {oembedHint && <div className="oembed-hint">{oembedHint}</div>}
          </div>
        </div>
        <div className="modal-actions">
          {saveError && <div className="oembed-hint" style={{ color: 'var(--red)', flex: 1, alignSelf: 'center' }}>{saveError}</div>}
          <button className="btn-text" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {iconSvg('check')}{saving ? 'Saving…' : 'Save pin'}
          </button>
        </div>
      </div>
    </div>
  );
}
