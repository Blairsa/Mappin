import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

// Stored via `firebase functions:secrets:set RAPIDAPI_KEY` — never in
// source control, never shipped to the browser.
const RAPIDAPI_KEY = defineSecret('RAPIDAPI_KEY');

async function resolveUrl(url, key) {
  const resp = await fetch(`https://redirect-resolver.p.rapidapi.com/?url=${encodeURIComponent(url)}`, {
    headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': 'redirect-resolver.p.rapidapi.com' },
  });
  if (!resp.ok) throw new Error(`unshorten failed: ${resp.status}`);
  const data = await resp.json();
  // Confirmed field path from a real vm.tiktok.com response.
  return data?.info?.final_url?.url || url;
}

async function extractInstagramMeta(url, key) {
  const resp = await fetch(`https://instagram-looter2.p.rapidapi.com/post?url=${encodeURIComponent(url)}`, {
    headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': 'instagram-looter2.p.rapidapi.com' },
  });
  if (!resp.ok) throw new Error(`instagram lookup failed: ${resp.status}`);
  const data = await resp.json();
  const loc = data.location;
  const caption = data.edge_media_to_caption?.edges?.[0]?.node?.text || '';
  return {
    platform: 'Instagram',
    name: loc?.name || 'Untitled place',
    geo: loc ? { lat: loc.lat, lng: loc.lng } : null,
    address: '',
    note: caption,
    url,
  };
}

async function extractTikTokMeta(url, key) {
  const resp = await fetch(`https://tiktok-scraper7.p.rapidapi.com/?url=${encodeURIComponent(url)}&hd=1`, {
    headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': 'tiktok-scraper7.p.rapidapi.com' },
  });
  if (!resp.ok) throw new Error(`tiktok lookup failed: ${resp.status}`);
  const data = await resp.json();
  const d = data.data;
  const poiAnchor = d.anchors?.find((a) => a.component_key === 'anchor_poi');
  const locExtra = poiAnchor?.extra ? JSON.parse(poiAnchor.extra) : null;
  const coords = locExtra?.location;
  return {
    platform: 'TikTok',
    name: locExtra?.Name || poiAnchor?.keyword || 'Untitled place',
    geo: coords ? { lat: parseFloat(coords.lat), lng: parseFloat(coords.lng) } : null,
    address: locExtra?.formatted_address || locExtra?.fallback_address || '',
    note: d.title || '',
    url,
  };
}

// Same "already long-form?" check as before — vm.tiktok.com contains
// "tiktok.com" too, so this has to check for the actual /video/ path,
// not just the domain.
function looksCanonical(url) {
  return /tiktok\.com\/@[^/]+\/video\/\d+/.test(url) || /instagram\.com\/(p|reel)\//.test(url);
}

export const enrichShare = onRequest({ secrets: [RAPIDAPI_KEY], cors: true }, async (req, res) => {
  const rawUrl = req.query.url;
  if (!rawUrl) {
    res.status(400).json({ error: 'missing url param' });
    return;
  }
  try {
    const key = RAPIDAPI_KEY.value();
    const finalUrl = looksCanonical(rawUrl) ? rawUrl : await resolveUrl(rawUrl, key);
    let meta = null;
    if (finalUrl.includes('instagram.com')) meta = await extractInstagramMeta(finalUrl, key);
    else if (finalUrl.includes('tiktok.com')) meta = await extractTikTokMeta(finalUrl, key);
    if (!meta) {
      res.status(422).json({ error: 'unsupported url', finalUrl });
      return;
    }
    res.json(meta);
  } catch (err) {
    console.error('enrichShare failed:', err);
    res.status(500).json({ error: err.message });
  }
});
