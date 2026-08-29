import { useEffect, useMemo, useState } from 'react';
import PinModal from './PinModal.jsx';

/**
 * The whole point of this component: it's the ONLY thing that renders on
 * the /share route. No Constellation, no Google Maps JS, no pin list — just
 * whatever's needed to show the Add Pin form as fast as possible.
 *
 * Speed + correctness: the form opens IMMEDIATELY with the raw title/text/
 * link from the OS share sheet — never blocked on the lookup below. It
 * runs in the background for as long as it takes (no artificial timeout —
 * a previous version raced this against a 1.2s clock, which meant slower
 * responses got cut off before they ever resolved). If it succeeds, a
 * small banner offers to apply it — never auto-applied, so it can never
 * silently overwrite something you've already started typing.
 *
 * NOTE: the actual Instagram/TikTok scraping + link-unshortening now
 * happens server-side in the enrichShare Cloud Function (functions/index.js)
 * — this component just calls that one endpoint. This keeps the RapidAPI
 * key out of the browser bundle entirely, and lets the function follow
 * TikTok's vm.tiktok.com redirects with a proper User-Agent server-side,
 * which a client-side fetch can't reliably do.
 */

// TODO: replace with your actual deployed function URL, printed in the
// terminal after `firebase deploy --only functions`.
const ENRICH_SHARE_URL = 'https://<your-region>-<your-project-id>.cloudfunctions.net/enrichShare';

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
        const resp = await fetch(`${ENRICH_SHARE_URL}?url=${encodeURIComponent(rawUrl)}`);
        if (!resp.ok) return; // 422 = unsupported link, not an error worth logging
        const meta = await resp.json();
        if (!cancelled) setSuggestion(meta);
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
