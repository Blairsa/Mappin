// ShareCapture.jsx — full replacement
import { useEffect, useState } from 'react';
import PinModal from './PinModal.jsx';

const ENRICH_SHARE_URL = 'https://us-central1-mappin-14d4d.cloudfunctions.net/enrichShare';
const ENRICH_TIMEOUT_MS = 7000; // safety net — don't wait forever on a hung RapidAPI call

// Captions rarely come as a clean "name" — TikTok/Instagram give you a
// sentence, then usually a 📍 and a string of hashtags. Everything before
// the 📍 (or the first sentence, if there's no 📍) is the best guess at
// something name-like. Only used when the scraper has no real POI name.
function guessNameFromCaption(text) {
  if (!text) return '';
  const beforePin = text.split('📍')[0].trim();
  const candidate = beforePin || text.trim();
  const firstSentence = candidate.match(/^[^.!?\n]+[.!?]?/);
  let name = (firstSentence ? firstSentence[0] : candidate).trim();
  name = name.replace(/#\w+/g, '').trim(); // strip stray hashtags
  if (name.length > 80) name = name.slice(0, 80).trim() + '…';
  return name;
}

export default function ShareCapture({ shareParams, tags, maps, currentMapId, onSwitchMap, onCreateTag, onSave }) {
  const rawUrl = shareParams?.url || '';
  const rawText = shareParams?.text || '';
  const rawTitle = shareParams?.title || '';

  // No link to enrich (e.g. shared plain text) — nothing to wait for.
  const [loading, setLoading] = useState(!!rawUrl);
  const [prefill, setPrefill] = useState({
    name: rawTitle,
    note: rawText,
    url: rawUrl,
    rating: 0,
    tags: [],
    autoSearchQuery: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!rawUrl) return;
    let done = false;

    const timeout = setTimeout(() => {
      if (!done) {
        done = true;
        const name = guessNameFromCaption(rawText);
        setPrefill((p) => ({ ...p, name: name || p.name }));
        setLoading(false);
      }
    }, ENRICH_TIMEOUT_MS);

    fetch(`${ENRICH_SHARE_URL}?url=${encodeURIComponent(rawUrl)}`)
      .then((resp) => (resp.ok ? resp.json() : null))
      .then((meta) => {
        if (done) return;
        done = true;
        clearTimeout(timeout);
        const name = meta?.name && meta.name !== 'Untitled place'
          ? meta.name
          : guessNameFromCaption(meta?.note || rawText);
        setPrefill({
          name,
          note: meta?.note || rawText,
          url: meta?.url || rawUrl,
          rating: 0,
          tags: [],
          autoSearchQuery: [name, meta?.address].filter(Boolean).join(', '),
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Share enrichment failed:', err);
        if (!done) {
          done = true;
          clearTimeout(timeout);
          const name = guessNameFromCaption(rawText);
          setPrefill((p) => ({ ...p, name: name || p.name }));
          setLoading(false);
        }
      });

    return () => { done = true; clearTimeout(timeout); };
  }, [rawUrl]);

  const finishAndClose = () => {
    window.history.replaceState({}, '', '/');
    setTimeout(() => window.close(), 300);
  };

  const handleSave = async (data) => {
    await onSave(data);
    setSaved(true);
    finishAndClose();
  };

  if (saved) {
    return (
      <div className="center-screen">
        <div style={{ fontSize: 40 }}>✅</div>
        <h2>Saved to Mappin</h2>
        <p style={{ color: 'var(--on-surface-var)' }}>You can close this tab now.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="center-screen">
        <div style={{ fontSize: 32 }}>📍</div>
        <h2>Just a moment…</h2>
        <p style={{ color: 'var(--on-surface-var)' }}>Grabbing details from your link.</p>
      </div>
    );
  }

  return (
    <div className="center-screen">
      {maps.length > 1 && (
        <div className="field" style={{ width: '100%', maxWidth: 420, margin: '0 auto 10px' }}>
          <label>Save to</label>
          <select value={currentMapId} onChange={(e) => onSwitchMap(e.target.value)}>
            {maps.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      )}
      <PinModal
        open
        onClose={finishAndClose}
        onSave={handleSave}
        onCreateTag={onCreateTag}
        tags={tags}
        initial={prefill}
      />
    </div>
  );
}
