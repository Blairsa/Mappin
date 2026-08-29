import { useEffect, useMemo, useState } from 'react';
import PinModal from './PinModal.jsx';

/**
 * The whole point of this component: it's the ONLY thing that renders on
 * the /share route. No Constellation, no Google Maps JS, no pin list — just
 * whatever's needed to show the Add Pin form as fast as possible.
 *
 * Speed + correctness: the form opens IMMEDIATELY with the raw title/text/
 * link from the OS share sheet — never blocked on the lookups below. Those
 * run in the background for as long as they take (no artificial timeout —
 * a previous version raced this against a 1.2s clock, which meant slower
 * RapidAPI responses got cut off before they ever resolved, making the
 * scrapers look broken when they were just running normally). If a lookup
 * succeeds, a small banner offers to apply it — never auto-applied, so it
 * can never silently overwrite something you've already started typing.
 *
 * NOTE on the Instagram/TikTok lookups below: these call third-party
 * RapidAPI scrapers, not official platform APIs — see the earlier chat
 * note on the ToS/reliability risk and the exposed-key issue.
 */

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

async function resolveUrl(url) {
  const resp = await fetch(`https://free-url-un-shortener.p.rapidapi.com/url?url=${encodeURIComponent(url)}`, {
    headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'free-url-un-shortener.p.rapidapi.com' },
  });
  if (!resp.ok) throw new Error(`unshorten failed: ${resp.status}`);
  const data = await resp.json();
  return data?.resolved_url || url;
}

async function extractInstagramMeta(url) {
  const resp = await fetch(`https://instagram-looter2.p.rapidapi.com/post?url=${encodeURIComponent(url)}`, {
    headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'instagram-looter2.p.rapidapi.com' },
  });
  if (!resp.ok) throw new Error(`instagram lookup failed: ${resp.status}`);
  const data = await resp.json();
  const loc = data.location;
  const caption = data.edge_media_to_caption?.edges?.[0]?.node?.text || '';
  return {
    platform: 'Instagram',
    name: loc?.name || 'Untitled place',
    geo: loc ? { lat: loc.lat, lng: loc.lng } : null,
    note: caption,
    url,
    rating: 0,
    tags: [],
  };
}
async function extractTikTokMeta(url) {
  const resp = await fetch(`https://tiktok-scraper7.p.rapidapi.com/?url=${encodeURIComponent(url)}&hd=1`, {
    headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'tiktok-scraper7.p.rapidapi.com' },
  });
  if (!resp.ok) throw new Error(`tiktok lookup failed: ${resp.status}`);
  const data = await resp.json();
  const d = data.data;

  // The location lives on whichever anchor has component_key "anchor_poi" —
  // don't assume it's anchors[0], other anchor types (templates, etc.) can
  // come first.
  const poiAnchor = d.anchors?.find((a) => a.component_key === 'anchor_poi');
  const locExtra = poiAnchor?.extra ? JSON.parse(poiAnchor.extra) : null;
  const coords = locExtra?.location;

  return {
    platform: 'TikTok',
    // Title -> the place, not the caption.
    name: locExtra?.Name || poiAnchor?.keyword || 'Untitled place',
    geo: coords ? { lat: parseFloat(coords.lat), lng: parseFloat(coords.lng) } : null,
    address: locExtra?.formatted_address || locExtra?.fallback_address || '',
    // Description -> the caption text. It's in `title`, not `content_desc`
    // (content_desc isn't reliably an array on this scraper).
    note: d.title || '',
    url,
    rating: 0,
    tags: [],
  };
}

export default function ShareCapture({ shareParams, tags, maps, currentMapId, onSwitchMap, onCreateTag, onSave }) {
  const rawFallback = useMemo(() => ({
    name: shareParams?.title || '',
    note: shareParams?.text || '',
    url: shareParams?.url || '',
    rating: 0,
    tags: [],
  }), [shareParams]);

  const [prefill, setPrefill] = useState(rawFallback);
  const [modalKey, setModalKey] = useState('raw'); // forces a clean remount only when the user explicitly applies a suggestion
  const [suggestion, setSuggestion] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const rawUrl = shareParams?.url;
    if (!rawUrl) return;

    async function run() {
      try {
        const looksCanonical = /instagram\.com|tiktok\.com/.test(rawUrl);
        const finalUrl = looksCanonical ? rawUrl : await resolveUrl(rawUrl);
        let meta = null;
        if (finalUrl.includes('instagram.com')) meta = await extractInstagramMeta(finalUrl);
        else if (finalUrl.includes('tiktok.com')) meta = await extractTikTokMeta(finalUrl);
        if (!cancelled && meta) setSuggestion(meta);
      } catch (err) {
        // Visible in devtools so a failure here is actually diagnosable
        // next time, instead of silently looking like "nothing happened".
        console.error('Share enrichment failed:', err);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [shareParams]);

  const applySuggestion = () => {
    setPrefill(suggestion);
    setModalKey('enriched'); // remount PinModal so it re-reads the new initial values
    setSuggestion(null);
  };

  const finishAndClose = () => {
    window.history.replaceState({}, '', '/');
    // Best-effort — works for windows opened via the share target in most
    // Android/Chrome versions. If the browser blocks a script-initiated
    // close (some do), the message below is the fallback.
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
      {suggestion && (
        <div className="oembed-hint" style={{
          background: 'var(--blue-bg)', color: 'var(--blue)', padding: '10px 16px',
          borderRadius: 12, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ flex: 1 }}>Found more details from {suggestion.platform}</span>
          <button className="btn btn-tonal" style={{ padding: '6px 12px' }} onClick={applySuggestion}>Use these</button>
          <button className="btn-text" style={{ padding: '6px 8px' }} onClick={() => setSuggestion(null)}>Dismiss</button>
        </div>
      )}
      <PinModal
        key={modalKey}
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
