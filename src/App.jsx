import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './hooks/useAuth.js';
import { useMaps } from './hooks/useMaps.js';
import { useMap } from './hooks/useMap.js';
import { usePins } from './hooks/usePins.js';
import Rail from './components/Rail.jsx';
import SearchAndFilters from './components/SearchAndFilters.jsx';
import Constellation from './components/Constellation.jsx';
import PinGrid from './components/PinGrid.jsx';
import PinModal from './components/PinModal.jsx';
import ViewPinModal from './components/ViewPinModal.jsx';
import ShareModal from './components/ShareModal.jsx';
import TagManager from './components/TagManager.jsx';
import { iconSvg } from './lib/icons.jsx';
import { latLngToPercent } from './lib/geo.js';

const DEFAULT_TAGS = {
activity:   { label: 'Activity',   color: '#EA4335', bg: '#FCE8E6', emoji: '🥾' },
holiday:    { label: 'Holiday',    color: '#188038', bg: '#E6F4EA', emoji: '🏖️' },
bar:        { label: 'Bar',        color: '#D93069', bg: '#FCE4EC', emoji: '🍸' },
cafe:       { label: 'Cafe',       color: '#12B5CB', bg: '#E0F7FA', emoji: '☕' },
restaurant: { label: 'Restaurant', color: '#F9AB00', bg: '#FEF7E0', emoji: '🍽️' },
scenery:    { label: 'Scenic',     color: '#34A853', bg: '#E6F4EA', emoji: '🌄' },
};

function readShareParams() {
  if (typeof window === 'undefined') return null;
  if (window.location.pathname !== '/share') return null;
  const params = new URLSearchParams(window.location.search);
  return {
    title: params.get('title') || '',
    text: params.get('text') || '',
    url: params.get('url') || '',
  };
}

const LAST_MAP_KEY = 'mappin.lastMapId';

export default function App() {
  // -----------------------------
  // ALL HOOKS MUST BE ABOVE ANY RETURN
  // -----------------------------

  const { user, signIn, signOut } = useAuth();
  const { maps, loading: mapsLoading, createMap } = useMaps(user?.email);

  const [currentMapId, setCurrentMapId] = useState(() => localStorage.getItem(LAST_MAP_KEY) || null);
  useEffect(() => {
    if (currentMapId) localStorage.setItem(LAST_MAP_KEY, currentMapId);
  }, [currentMapId]);

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

  const { mapDoc, addCollaborator, removeCollaborator, updateTags } = useMap(currentMapId);
  const { pins, addPin, updatePin, deletePin } = usePins(currentMapId);

  const [view, setView] = useState('map');
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [editingPin, setEditingPin] = useState(null);
  const [viewingPinId, setViewingPinId] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [tagManagerOpen, setTagManagerOpen] = useState(false);

  const shareParams = useMemo(readShareParams, []);
  const [prefill, setPrefill] = useState(
    shareParams && (shareParams.url || shareParams.text)
      ? { name: shareParams.title, note: shareParams.text, url: shareParams.url, rating: 0, tags: [] }
      : null
  );

  // THIS HOOK MUST BE ABOVE ANY RETURN
  useEffect(() => {
    if (mapDoc && (!mapDoc.tags || !Object.keys(mapDoc.tags).length)) {
      updateTags(DEFAULT_TAGS);
    }
  }, [mapDoc?.id, mapDoc?.tags, updateTags]);

  // -----------------------------
  // SAFE CONDITIONAL RETURNS
  // -----------------------------

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

  // -----------------------------
  // MAIN RENDER
  // -----------------------------

  const tags = mapDoc.tags && Object.keys(mapDoc.tags).length ? mapDoc.tags : DEFAULT_TAGS;

  const matchesSearch = (p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [p.name, p.address, p.note].filter(Boolean).some((f) => f.toLowerCase().includes(q));
  };

  const matchesFilter = (p) =>
    activeFilters.size === 0 || p.tags?.some((t) => activeFilters.has(t));

  const toggleFilter = (key) =>
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const visiblePins = pins.filter(matchesSearch);

  const addedByLabel = (uid) =>
    uid === user.uid ? (user.displayName || 'You') : 'Collaborator';

  const openAdd = () => {
    setEditingPin(null);
    setPinModalOpen(true);
  };

  const openEdit = (pin) => {
    setEditingPin(pin);
    setPrefill(null);
    setPinModalOpen(true);
    setViewingPinId(null);
  };

  const handleSave = async (data) => {
    const pos = data.geo
      ? latLngToPercent(data.geo.lat, data.geo.lng)
      : editingPin?.pos || { x: 20 + Math.random() * 60, y: 20 + Math.random() * 55 };

    if (editingPin) {
      await updatePin(editingPin.id, { ...data, pos });
    } else {
      await addPin({ ...data, pos }, user.uid);
    }

    setPinModalOpen(false);
    setPrefill(null);

    if (window.location.pathname === '/share') {
      window.history.replaceState({}, '', '/');
    }
  };

  const viewingPin = pins.find((p) => p.id === viewingPinId);

  return (
    <div className="shell">
      <Rail
        view={view}
        setView={setView}
        maps={maps}
        currentMapId={currentMapId}
        onSwitchMap={setCurrentMapId}
        onCreateMap={(name) => createMap(user.uid, user.email, name).then(setCurrentMapId)}
        onOpenTags={() => setTagManagerOpen(true)}
        onOpenShare={() => setShareOpen(true)}
        onSignOut={signOut}
      />

      <main>
        {view === 'map' && (
          <section className="panel">
            <Constellation
              pins={visiblePins}
              tags={tags}
              matchesFilter={matchesFilter}
              onOpenPin={setViewingPinId}
            >
              <SearchAndFilters
                floating
                mapName={mapDoc.name}
                search={search}
                setSearch={setSearch}
                tags={tags}
                pins={pins}
                activeFilters={activeFilters}
                toggleFilter={toggleFilter}
                clearFilters={() => setActiveFilters(new Set())}
              />
            </Constellation>
          </section>
        )}

        {view === 'list' && (
          <section className="panel">
            <div style={{ padding: '16px 22px 0' }}>
              <SearchAndFilters
                mapName={mapDoc.name}
                search={search}
                setSearch={setSearch}
                tags={tags}
                pins={pins}
                activeFilters={activeFilters}
                toggleFilter={toggleFilter}
                clearFilters={() => setActiveFilters(new Set())}
              />
            </div>

            <div className="panel-head">
              <h2>All pins</h2>
              <p>{visiblePins.filter(matchesFilter).length} of {visiblePins.length} shown</p>
            </div>

            <PinGrid
              pins={visiblePins}
              tags={tags}
              matchesFilter={matchesFilter}
              onOpenPin={setViewingPinId}
              addedByLabel={addedByLabel}
            />
          </section>
        )}
      </main>

      <button className="fab" onClick={openAdd}>{iconSvg('add')}</button>

      <PinModal
        open={pinModalOpen || !!prefill}
        onClose={() => {
          setPinModalOpen(false);
          setEditingPin(null);
          setPrefill(null);
        }}
        onSave={handleSave}
        tags={tags}
        initial={editingPin || prefill}
      />

      <ViewPinModal
        pin={viewingPin}
        tags={tags}
        addedByLabel={addedByLabel}
        onClose={() => setViewingPinId(null)}
        onEdit={() => openEdit(viewingPin)}
        onDelete={() => {
          deletePin(viewingPin.id);
          setViewingPinId(null);
        }}
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
      />
    </div>
  );
}
