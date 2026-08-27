import { useEffect, useState } from 'react';
import PinModal from './PinModal.jsx';

/**
 * The whole point of this component: it's the ONLY thing that renders on
 * the /share route. No Constellation, no Google Maps JS, no pin list — just
 * whatever's needed to show the Add Pin form as fast as possible, save,
 * and hand control back to whatever app the share came from.
 *
 * NOTE on the Instagram/TikTok lookups below: these call third-party
 * RapidAPI scrapers, not official platform APIs. Relocated from App.jsx
 * as-is for this fix — see the chat note on why this approach carries
 * real ToS and reliability risk, and why the API key needs rotating.
 */

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
// ⚠️ Moving this to an env var does NOT hide it — Vite bakes VITE_-prefixed
// vars into the shipped JS just like a hardcoded string would be. It's
// still fully visible to anyone inspecting the deployed site. The only way
// to actually keep this key private is a server-side proxy (e.g. a Cloud
// Function) that the client calls instead of RapidAPI directly. Not built
// here — flagging so this isn't mistaken for a fix.

async function resolveUrl(url) {
  const resp = await fetch(`https://free-url-un-shortener.p.rapidapi.com/url?url=${encodeURIComponent(url)}`, {
    headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'free-url-un-shortener.p.rapidapi.com' },
  });
  const data = await resp.json();
  return data?.resolved_url || url;
}

async function extractInstagramMeta(url) {
  const resp = await fetch(`https://instagram-looter2.p.rapidapi.com/post?url=${encodeURIComponent(url)}`, {
    headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'instagram-looter2.p.rapidapi.com' },
  });
  const data = await resp.json();
  const loc = data.location;
  const caption = data.edge_media_to_caption?.edges?.[0]?.node?.text || '';
  return {
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
  const data = await resp.json();
  const d = data.data;
  const locExtra = d.anchors?.[0]?.extra ? JSON.parse(d.anchors[0].extra) : null;
  const coords = locExtra?.location;
  const caption = d.content_desc?.join('\n').trim() || d.title || '';
  return {
    name: locExtra?.Name || d.keyword || 'Untitled place',
    geo: coords ? { lat: parseFloat(coords.lat), lng: parseFloat(coords.lng) } : null,
    address: locExtra?.formatted_address || locExtra?.fallback_address || '',
    note: caption,
    url,
    rating: 0,
    tags: [],
  };
}

export default function ShareCapture({ shareParams, tags, onCreateTag, onSave }) {
  const [prefill, setPrefill] = useState(null);
  const [resolving, setResolving] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!shareParams?.url) {
        if (!cancelled) {
          setPrefill({ name: shareParams?.title || '', note: shareParams?.text || '', url: '', rating: 0, tags: [] });
          setResolving(false);
        }
        return;
      }
      try {
        const finalUrl = await resolveUrl(shareParams.url);
        let meta = null;
        if (finalUrl.includes('instagram.com')) meta = await extractInstagramMeta(finalUrl);
        else if (finalUrl.includes('tiktok.com')) meta = await extractTikTokMeta(finalUrl);
        if (!cancelled) {
          setPrefill(meta || { name: shareParams.title || '', note: shareParams.text || '', url: finalUrl, rating: 0, tags: [] });
        }
      } catch {
        // Scraper/unshorten call failed (blocked, rate-limited, endpoint
        // changed — any of these are plausible with unofficial APIs).
        // Fall back to whatever the OS share sheet gave us directly rather
        // than losing the share entirely.
        if (!cancelled) {
          setPrefill({ name: shareParams.title || '', note: shareParams.text || '', url: shareParams.url, rating: 0, tags: [] });
        }
      } finally {
        if (!cancelled) setResolving(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [shareParams]);

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

  if (resolving) {
    return <div className="center-screen">Reading link…</div>;
  }

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
