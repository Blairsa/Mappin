# Mappin

A collaborative places tracker — pins, tags, ratings, and a share-to-map
flow — built with React, Vite, and Firebase (Auth + Firestore), matching
the stack you're already using for Noted.

## On the TikTok scraper API

You found a RapidAPI "TikTok Scraper" that returns POI data (name, address,
lat/lng) pulled from a shared video — I didn't wire it in, and want to
explain why rather than just skip it.

That API isn't TikTok's — it's a third party reverse-engineering TikTok's
private app endpoints and reselling the output. Repackaging it as a paid
(or "free tier") product on RapidAPI doesn't make it authorized: TikTok's
terms explicitly prohibit scraping, and this is scraping wearing a nicer
UI. A few concrete reasons I'd stay away from it even setting that aside:

- **It's fragile.** Look at the response you pasted — `play`, `hdplay`,
  and the cover images are all signed URLs with `x-expires` timestamps a
  few hours out. This wrapper is riding on TikTok's internal, unstable
  endpoints; TikTok can and does change these without notice, and RapidAPI
  scrapers routinely break or get pulled entirely.
- **It's not guaranteed data.** The POI block you saw only appears because
  that particular creator tagged a location. Most posts don't. You'd still
  need a manual fallback for the common case, so this buys you less than
  it looks like.
- **Real risk to a real app.** This was a mockup question before; now
  you're asking me to put it in a codebase you're going to deploy and use.
  If TikTok pursues takedowns against apps built on unofficial scrapers
  (they have, repeatedly), that's your app, not a hypothetical.

What's already built instead — official YouTube/TikTok oEmbed for
title/author, the Web Share Target for captions, and now real Google
Places Autocomplete for address (below) — covers the same ground without
the legal exposure or the fragility.

## What's new since last time

- **Real address input.** `AddressAutocomplete` uses Google's current
  `PlaceAutocompleteElement` (the older `Autocomplete` widget is no longer
  issued to new API keys as of March 2025, so this is written against the
  one you'll actually be able to use).
- **The Google tab is live.** Pulls real rating/hours/phone/photos via the
  new `Place.fetchFields()` API, using the `placeId` captured from
  Autocomplete.
- **Pin position on the map is now real**, derived from the place's
  lat/lng via a simple projection (`src/lib/geo.js`) instead of random.
- **Multiple maps.** See below.

## On multiple maps — what I built and why

You asked the right question: should a second map (say, one with Kerry and
someone else) share pins with your main map automatically, or stay
separate? I went with **fully separate by default, explicit sharing per
map** — here's the reasoning:

- **Isolation is the safer default.** If pins auto-shared across every map
  you're part of, a place you saved on a map with one person would quietly
  show up on a map with someone else. That's the kind of surprise that's
  awkward at best. Explicit is safer than implicit for anything
  relationship-shaped.
- **It's also the simpler mental model.** "This map has these pins, these
  people" is easy to reason about. "This map mostly has its own pins, plus
  some from other maps I'm on" is not.
- **If you ever do want to bring a specific pin across**, that's a small,
  addressable feature later — a "copy to another map" action on a pin —
  rather than a standing behavior you'd have to remember is happening.

I built it as first-class now rather than bolting it on later, because you
flagged last time that retrofitting the data model after you have real
pins in it is the expensive path. Concretely:

- Each map is its own Firestore doc (`maps/{autoId}`) with its own
  `memberEmails` and `tags`, holding its own `pins` subcollection.
- `useMaps.js` queries every map where your signed-in email is a member.
- The switcher at the top of the page lists all your maps and lets you
  create new ones — start with "My Map", spin up "Kerry + Sam" whenever
  you need it.
- Access is still Google-auth-based: whoever you add to a map's
  `memberEmails` can see and edit that map's pins, and nothing else.

## Stack

- React 18 + Vite
- Firebase Auth (Google sign-in) + Firestore (data + collaboration)
- Google Maps JavaScript API (Places library) for address + place details
- Deployed via Firebase Hosting, auto-deployed on push to `main` via
  GitHub Actions

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in your Firebase + Google Maps config
npm run dev
```

### Firebase project setup

1. Create a project at https://console.firebase.google.com
2. Enable **Authentication → Google** sign-in provider
3. Create a **Firestore database** (production mode)
4. In Project Settings → Your apps, add a Web app and copy the config
   values into `.env.local`
5. Firestore needs a composite index for the "maps I belong to" query —
   Firestore will show you the exact console link the first time it runs
   and errors; click it, it self-configures
6. Install the Firebase CLI (`npm i -g firebase-tools`), run `firebase login`,
   then `firebase deploy --only firestore:rules` to push `firestore.rules`
7. Copy `.firebaserc.example` to `.firebaserc` and put your real project ID in it

### Google Maps / Places setup

1. In the same or a separate Google Cloud project, enable the
   **"Places API (New)"** and **"Maps JavaScript API"**
2. Create an API key, then **restrict it**: HTTP referrer restriction to
   your actual domain(s) (and `localhost` for dev), API restriction to
   just the two APIs above
3. Put the key in `.env.local` as `VITE_GOOGLE_MAPS_API_KEY`
4. Billing needs to be enabled on the Google Cloud project — Places usage
   has a free monthly credit, but the key won't work without billing set up

## Deploying via GitHub Actions

1. Push this repo to GitHub
2. Generate a Firebase service account: Project Settings → Service
   Accounts → Generate new private key
3. In your GitHub repo, go to Settings → Secrets and variables → Actions,
   and add:
   - `FIREBASE_SERVICE_ACCOUNT` — the full JSON key from step 2
   - The six `VITE_FIREBASE_*` values from your `.env.local`
   - `VITE_GOOGLE_MAPS_API_KEY`
4. Edit `.github/workflows/deploy.yml` and replace `your-firebase-project-id`
   with your real project ID (two places: the workflow, and `.firebaserc`)
5. Push to `main` — the workflow builds and deploys automatically

## Not done yet — deliberately left as next steps

- **App icons.** `public/manifest.json` references `/icon-192.png` and
  `/icon-512.png` that don't exist yet — add real ones before deploying.
- **EEA billing address restriction.** If your Google Cloud billing
  address is in the EEA, the Autocomplete-without-a-map pattern used here
  has some restrictions per Google's docs — worth a quick check against
  current docs if that applies to you.
- **"Copy pin to another map."** Mentioned above — not built, but the data
  model doesn't fight you if you want to add it.
- **Rating vs. visited as separate fields.** Flagged last time, still
  true: right now 0 stars means both "not visited" and can't distinguish
  from "visited, thought it was genuinely bad." Worth splitting into two
  fields if that distinction matters to you.
