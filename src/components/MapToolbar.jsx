import { useState } from 'react';
import { iconSvg } from '../lib/icons.jsx';
import MapPicker from './MapPicker.jsx';

/**
 * The floating two-row overlay on the map: search alone on row 1, then a
 * row of small individual pill buttons (map picker, city count, tag
 * filter, settings) with map visible in the gaps between them — modelled
 * on the original app's floating button row rather than one solid card.
 */
export default function MapToolbar({
  search, setSearch, mapName,
  maps, currentMapId, onSwitchMap, onCreateMap,
  pinsByCity, onSelectCity,
  tags, pins, activeFilters, toggleFilter, clearFilters,
  onOpenShare, onOpenTags,
  onSignOut,
}) {
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [citiesOpen, setCitiesOpen] = useState(false);
  const [tagsPanelOpen, setTagsPanelOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const openOnly = (which) => {
    setMapPickerOpen(which === 'map' && !mapPickerOpen);
    setCitiesOpen(which === 'cities' && !citiesOpen);
    setTagsPanelOpen(which === 'tags' && !tagsPanelOpen);
    setSettingsOpen(which === 'settings' && !settingsOpen);
  };

  const cityNames = Object.keys(pinsByCity).sort();
  const counts = {};
  Object.keys(tags).forEach((k) => { counts[k] = pins.filter((p) => p.tags?.includes(k)).length; });

  return (
    <div className="map-overlay">
      <div className="search-row">
        <div className="searchpill">
          {iconSvg('search')}
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search on "${mapName}"…`} />
        </div>
      </div>

      <div className="toolbar-row">
        <div style={{ position: 'relative' }}>
          <button className="pill-btn" onClick={() => openOnly('map')}>
            {iconSvg('map')} {mapName} {iconSvg('expand_more')}
          </button>
          {mapPickerOpen && (
            <MapPicker
              maps={maps}
              currentMapId={currentMapId}
              onSwitch={(id) => { onSwitchMap(id); setMapPickerOpen(false); }}
              onCreate={(name) => { onCreateMap(name); setMapPickerOpen(false); }}
            />
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button className="pill-btn" onClick={() => openOnly('cities')}>
            {cityNames.length} {cityNames.length === 1 ? 'City' : 'Cities'} {iconSvg('expand_more')}
          </button>
          {citiesOpen && (
            <div className="map-flyout">
              <div className="map-flyout-title">Jump to a city</div>
              {cityNames.length === 0 && (
                <div style={{ padding: 8, fontSize: 13, color: 'var(--on-surface-var)' }}>No addresses yet</div>
              )}
              {cityNames.map((name) => (
                <button key={name} className="map-flyout-item" onClick={() => { onSelectCity(name); setCitiesOpen(false); }}>
                  <span style={{ width: 16, flex: 'none' }} />
                  <span>{name} ({pinsByCity[name].length})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className={`pill-btn ${tagsPanelOpen ? 'active' : ''}`} onClick={() => openOnly('tags')}>
          {iconSvg('label')} Tags
        </button>

        <div style={{ position: 'relative' }}>
          <button className="pill-btn" onClick={() => openOnly('settings')}>
            {iconSvg('settings')} Settings
          </button>
          {settingsOpen && (
  <div className="settings-menu">
    <button onClick={() => { onOpenShare(); setSettingsOpen(false); }}>
      {iconSvg('share')} Manage sharing
    </button>
    <button onClick={() => { onOpenTags(); setSettingsOpen(false); }}>
      {iconSvg('edit')} Edit tags
    </button>
    <button onClick={() => { onSignOut(); setSettingsOpen(false); }}>
      {iconSvg('logout')} Log out
    </button>
  </div>
)}

        </div>
      </div>

      {tagsPanelOpen && (
        <div className="chip-panel">
          <div className={`chip ${activeFilters.size === 0 ? 'active' : ''}`} onClick={clearFilters}>All ({pins.length})</div>
          {Object.entries(tags).map(([key, t]) => {
            if (!counts[key]) return null;
            return (
              <div key={key} className={`chip ${activeFilters.has(key) ? 'active' : ''}`} onClick={() => toggleFilter(key)}>
                <span className="dot" style={{ background: t.color }} />
                {t.emoji} {t.label} ({counts[key]})
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
