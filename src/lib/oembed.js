/**
 * Legitimate, ToS-compliant metadata lookup for shared links.
 *
 * YouTube and TikTok both run public oEmbed endpoints that need no login
 * and no API key — you hand them a URL, they hand back title/author/
 * thumbnail. That's what powers the "fetch from link" button in the pin
 * form.
 *
 * Instagram and Facebook do NOT have an open oEmbed endpoint any more —
 * Meta locked theirs behind an access token and app review in 2020. There
 * is no free, unauthenticated way to pull a caption straight off an
 * Instagram/Facebook URL, and scraping the page instead would break their
 * terms of service, so this deliberately does not attempt it. For those
 * two platforms we rely on whatever text Android's share sheet hands us
 * (see /share route in App.jsx) — most sharing apps include the caption
 * in the shared "text" field, so it still lands in Mappin, just via the
 * share sheet rather than a scrape.
 */

export function detectPlatform(url) {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('facebook.com') || u.includes('fb.watch')) return 'facebook';
  return 'other';
}

async function fetchOEmbed(endpoint, url) {
  const res = await fetch(`${endpoint}?url=${encodeURIComponent(url)}&format=json`);
  if (!res.ok) throw new Error(`oEmbed request failed (${res.status})`);
  return res.json();
}

/**
 * Returns { title, author, thumbnailUrl, supported: true } for YouTube/TikTok,
 * or { supported: false, reason } for platforms without a public oEmbed.
 */
export async function enrichFromUrl(url) {
  const platform = detectPlatform(url);

  try {
    if (platform === 'youtube') {
      const data = await fetchOEmbed('https://www.youtube.com/oembed', url);
      return { supported: true, platform, title: data.title, author: data.author_name, thumbnailUrl: data.thumbnail_url };
    }
    if (platform === 'tiktok') {
      const data = await fetchOEmbed('https://www.tiktok.com/oembed', url);
      return { supported: true, platform, title: data.title, author: data.author_name, thumbnailUrl: data.thumbnail_url };
    }
  } catch (err) {
    return { supported: false, platform, reason: 'Could not reach oEmbed endpoint — the link may be private or removed.' };
  }

  if (platform === 'instagram' || platform === 'facebook') {
    return {
      supported: false,
      platform,
      reason: 'Meta requires a logged-in access token for this — paste the caption in manually, or share the post from your phone so the caption comes across in the share text.',
    };
  }

  return { supported: false, platform, reason: 'No metadata source for this link — you can still save it, just fill the fields in by hand.' };
}
