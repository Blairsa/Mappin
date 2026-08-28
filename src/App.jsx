import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useAuth } from './hooks/useAuth.js';
import { useMaps } from './hooks/useMaps.js';
import { useMap } from './hooks/useMap.js';
import { usePins } from './hooks/usePins.js';
import PinModal from './components/PinModal.jsx';
import ShareCapture from './components/ShareCapture.jsx';
import { iconSvg } from './lib/icons.jsx';
import { latLngToPercent } from './lib/geo.js';

// Lazy-loaded: none of these are needed on /share, so on that route their
// JS is never even downloaded, not just "not rendered". This is the actual
// fix for the share flow loading the whole app's code — everything above
// this comment is a normal static import because /share needs it
// immediately; everything below is deferred.
const Constellation = lazy(() => import('./components/Constellation.jsx'));
const MapToolbar = lazy(() => import('./components/MapToolbar.jsx'));
const SearchAndFilters = lazy(() => import('./components/SearchAndFilters.jsx'));
const PinGrid = lazy(() => import('./components/PinGrid.jsx'));
const ViewPinModal = lazy(() => import('./components/ViewPinModal.jsx'));
const ShareModal = lazy(() => import('./components/ShareModal.jsx'));
const TagManager = lazy(() => import('./components/TagManager.jsx'));

const DEFAULT_TAGS = {
  activity:   { label: 'Activity',   color: '#EA4335', bg: '#FCE8E6', emoji: '🥾' },
  holiday:    { label: 'Holiday',    color: '#188038', bg: '#E6F4EA', emoji: '🏖️' },
  bar:        { label: 'Bar',        color: '#D93069', bg: '#FCE4EC', emoji: '🍸' },
  cafe:       { label: 'Cafe',       color: '#12B5CB', bg: '#E0F7FA', emoji: '☕' },
  restaurant: { label: 'Restaurant', color: '#F9AB00', bg: '#FEF7E0', emoji: '🍽️' },
};

const TAG_COLOR_POOL = ['#EA4335','#D93069','#5E35B1','#3F51B5','#1A73E8','#12B5CB','#009688','#188038','#7CB342','#F9AB00','#FB8C00','#6D4C41'];

function slugifyTag(label) {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
}

// Parses whatever the OS share sheet handed over at /share?title=&text=&url=
// per the GET share_target in public/manifest.json. Many apps — TikTok and
// Instagram included — don't populate the separate "url" param at all; they
// just dump the caption and link together into "text". So if url comes back
// empty, pull the first http(s) link out of text instead of losing it.
function readShareParams() {
  if (window.location.pathname !== '/share') return null;
  const params = new URLSearchParams(window.location.search);
  const title = params.get('title') || '';
  const text = params.get('text') || '';
  let url = params.get('url') || '';
  if (!url && text) {
    const match = text.match(/https?:\/\/\S+/);
    if (match) url = match[0];
  }
  return { title, text, url };
}

// Rough "distinct places" grouping for the toolbar's city list — not
// precise city extraction, just the second-to-last comma-separated segment
// of the address when there is one, otherwise the whole address.
function cityOf(address) {
  if (!address) return null;
  const parts = address.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 2];
  return parts[0] || null;
}

const LAST_MAP_KEY = 'mappin.lastMapId';

export default function App() {
  const { user, signIn, signOut } = useAuth();
  const { maps, loading: mapsLoading, createMap } = useMaps(user?.email);

  const [currentMapId, setCurrentMapId] = useState(() => localStorage.getItem(LAST_MAP_KEY) || null);
  useEffect(() => {
    if (currentMapId) localStorage.setItem(LAST_MAP_KEY, currentMapId);
  }, [currentMapId]);

  // If the remembered map isn't in this user's list (or none remembered yet),
  // fall back to their first map. If they have none at all, create one.
  useEffect(() => {
    if (!user || mapsLoading) return;
    if (maps.length === 0) {
      createMap(user.uid, user.email, 'My Map').then(setCurrentMapId);
      return;
    }
    if (!currentMapId || !maps.some((m) => m.id === currentMapId)) {
      setCurrentMapId(maps[0].id);
    }
  }, [user, mapsLoading, maps, currentMapId, createMap]);

  const isShareRoute = window.location.pathname === '/share';
  const shareParams = useMemo(readShareParams, []);

  const { mapDoc, addCollaborator, removeCollaborator, updateTags } = useMap(currentMapId);
  // Share flow only ever writes ONE new pin — no reason to download the
  // whole pins collection just to do that, so the subscription is skipped
  // entirely on that path.
  const { pins, addPin, updatePin, deletePin } = usePins(currentMapId, { enabled: !isShareRoute });

  const [view, setView] = useState('map');
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [editingPin, setEditingPin] = useState(null);
  const [viewingPinId, setViewingPinId] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [tagManagerOpen, setTagManagerOpen] = useState(false);
  const [focusRequest, setFocusRequest] = useState(null);

  // Backfill default tags onto any map that doesn't have any yet. This has
  // to be a hook that runs on every render, unconditionally — the actual
  // conditional logic lives inside the callback, never around the hook
  // call itself — and it must stay above every early return below.
  useEffect(() => {
    if (mapDoc && (!mapDoc.tags || !Object.keys(mapDoc.tags).length)) {
      updateTags(DEFAULT_TAGS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapDoc]);

  if (user === undefined) return <div className="center-screen">Loading…</div>;

  if (!user) {
    return (
      <div className="center-screen">
        <h1 style={{ fontFamily: 'Roboto', fontWeight: 700 }}>Mappin</h1>
        <button className="btn btn-primary" onClick={signIn}>Sign in with Google</button>
      </div>
    );
  }

  if (mapsLoading || !currentMapId || !mapDoc) {
    return <div className="center-screen">Loading your maps…</div>;
  }

  const tags = mapDoc.tags && Object.keys(mapDoc.tags).length ? mapDoc.tags : DEFAULT_TAGS;

  // Lets the Add Pin form (and Tag Manager) create a brand-new tag inline.
  // Defined before the share-route branch below, since ShareCapture needs it too.
  const handleCreateTag = async (label) => {
    const trimmed = (label || '').trim();
    if (!trimmed) return null;
    const key = slugifyTag(trimmed) || `tag${Date.now()}`;
    if (tags[key]) return key;
    const color = TAG_COLOR_POOL[Object.keys(tags).length % TAG_COLOR_POOL.length];
    await updateTags({ ...tags, [key]: { label: trimmed, color, bg: color + '22', emoji: '📍' } });
    return key;
  };

  // The entire point of this branch: nothing below it — no Constellation,
  // no Google Maps JS, no pin list — ever renders OR gets its JS downloaded
  // on /share, since it's all behind React.lazy() above.
  if (isShareRoute) {
    return (
      <ShareCapture
        shareParams={shareParams}
        tags={tags}
        maps={maps}
        currentMapId={currentMapId}
        onSwitchMap={setCurrentMapId}
        onCreateTag={handleCreateTag}
        onSave={(data) => {
          const pos = data.geo
            ? latLngToPercent(data.geo.lat, data.geo.lng)
            : { x: 20 + Math.random() * 60, y: 20 + Math.random() * 55 };
          return addPin({ ...data, pos }, user.uid);
        }}
      />
    );
  }

  const matchesSearch = (p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [p.name, p.address, p.note].filter(Boolean).some((f) => f.toLowerCase().includes(q));
  };
  const matchesFilter = (p) => activeFilters.size === 0 || p.tags?.some((t) => activeFilters.has(t));
  const toggleFilter = (key) => setActiveFilters((prev) => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });
  const visiblePins = pins.filter(matchesSearch);

  const pinsByCity = {};
  pins.forEach((p) => {
    const c = cityOf(p.address);
    if (!c) return;
    (pinsByCity[c] = pinsByCity[c] || []).push(p);
  });

  const addedByLabel = (uid) => (uid === user.uid ? (user.displayName || 'You') : 'Collaborator');

  const openAdd = () => { setEditingPin(null); setPinModalOpen(true); };
  const openEdit = (pin) => { setEditingPin(pin); setPinModalOpen(true); setViewingPinId(null); };

  const handleSave = async (data) => {
    const pos = data.geo
      ? latLngToPercent(data.geo.lat, data.geo.lng)
      : (editingPin?.pos || { x: 20 + Math.random() * 60, y: 20 + Math.random() * 55 });
    if (editingPin) {
      await updatePin(editingPin.id, { ...data, pos });
    } else {
      await addPin({ ...data, pos }, user.uid);
    }
    setPinModalOpen(false);
  };

  const handleSelectCity = (cityName) => {
    setFocusRequest({ pins: pinsByCity[cityName] || [] });
  };

  const viewingPin = pins.find((p) => p.id === viewingPinId);

  return (
    <Suspense fallback={<div className="center-screen">Loading…</div>}>
      <div className="shell">
        <div className="content-area">
          {view === 'map' && (
            <div className="map-stage">
              <Constellation
                pins={visiblePins} tags={tags} matchesFilter={matchesFilter}
                onOpenPin={setViewingPinId} focusRequest={focusRequest}
              >
                <MapToolbar
                  search={search} setSearch={setSearch} mapName={mapDoc.name}
                  maps={maps} currentMapId={currentMapId} onSwitchMap={setCurrentMapId}
                  onCreateMap={(name) => createMap(user.uid, user.email, name).then(setCurrentMapId)}
                  pinsByCity={pinsByCity} onSelectCity={handleSelectCity}
                  tags={tags} pins={pins} activeFilters={activeFilters}
                  toggleFilter={toggleFilter} clearFilters={() => setActiveFilters(new Set())}
                  onOpenShare={() => setShareOpen(true)} onOpenTags={() => setTagManagerOpen(true)}
                  onSignOut={signOut}
                />
              </Constellation>
            </div>
          )}

          {view === 'list' && (
            <main className="list-stage">
              <section className="panel">
                <div style={{ padding: '16px 22px 0' }}>
                  <SearchAndFilters mapName={mapDoc.name} search={search} setSearch={setSearch} tags={tags} pins={pins}
                    activeFilters={activeFilters} toggleFilter={toggleFilter} clearFilters={() => setActiveFilters(new Set())} />
                </div>
                <div className="panel-head">
                  <h2>All pins</h2>
                  <p>{visiblePins.filter(matchesFilter).length} of {visiblePins.length} shown</p>
                </div>
                <PinGrid pins={visiblePins} tags={tags} matchesFilter={matchesFilter} onOpenPin={setViewingPinId} addedByLabel={addedByLabel} />
              </section>
            </main>
          )}
        </div>

        <div className="top-right-controls">
          <button className="pill-btn" onClick={() => setView(view === 'map' ? 'list' : 'map')}>
            {iconSvg(view === 'map' ? 'view_list' : 'map')} <span className="btn-label">{view === 'map' ? 'List' : 'Map'}</span>
          </button>
        </div>

        <button className="fab" onClick={openAdd}>{iconSvg('add')}</button>

        <PinModal
          open={pinModalOpen}
          onClose={() => { setPinModalOpen(false); setEditingPin(null); }}
          onSave={handleSave}
          onCreateTag={handleCreateTag}
          tags={tags}
          initial={editingPin}
        />

        <ViewPinModal
          pin={viewingPin}
          tags={tags}
          addedByLabel={addedByLabel}
          onClose={() => setViewingPinId(null)}
          onEdit={() => openEdit(viewingPin)}
          onDelete={() => { deletePin(viewingPin.id); setViewingPinId(null); }}
        />

        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          mapDoc={mapDoc}
          onAddCollaborator={addCollaborator}
          onRemoveCollaborator={removeCollaborator}
        />

        <TagManager
          open={tagManagerOpen}
          onClose={() => setTagManagerOpen(false)}
          tags={tags}
          pins={pins}
          onUpdateTags={updateTags}
          onCreateTag={handleCreateTag}
        />
      </div>
    </Suspense>
  );
}
