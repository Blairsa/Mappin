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

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), address, placeId, geo, note: note.trim(), url: url.trim(), rating, tags: selectedTags });
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
            <label>Link (booking, menu, TikTok/YouTube/Instagram post…)</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            <button className="btn-text" style={{ padding: '6px 0' }} onClick={handleFetch} disabled={!url || fetching}>
              {fetching ? 'Fetching…' : 'Fetch details from link'}
            </button>
            {oembedHint && <div className="oembed-hint">{oembedHint}</div>}
          </div>
          <div className="field">
            <label>Address</label>
            <AddressAutocomplete onSelect={({ name: pName, address: pAddr, placeId: pid, lat, lng }) => {
              setAddress(pAddr);
              setPlaceId(pid);
              setGeo(lat != null && lng != null ? { lat, lng } : null);
              if (!name) setName(pName);
            }} />
            {address && <div className="oembed-hint">Selected: {address}</div>}
          </div>
          <div className="field">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name this place…" />
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
            <label>{rating === 0 ? "Why you're saving this" : 'Your notes'}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={rating === 0 ? 'Booking details, table preference, the caption from the post…' : 'How was it? Would you go back?'}
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
        </div>
        <div className="modal-actions">
          <button className="btn-text" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{iconSvg('check')}Save pin</button>
        </div>
      </div>
    </div>
  );
}
