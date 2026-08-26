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
  cityCount,
  tags, pins, activeFilters, toggleFilter, clearFilters,
  onOpenShare, onOpenTags,
}) {
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [tagsPanelOpen, setTagsPanelOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const openOnly = (which) => {
    setMapPickerOpen(which === 'map' && !mapPickerOpen);
    setTagsPanelOpen(which === 'tags' && !tagsPanelOpen);
    setSettingsOpen(which === 'settings' && !settingsOpen);
  };

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

        <div className="pill-btn stat">{cityCount} {cityCount === 1 ? 'City' : 'Cities'}</div>

        <button className={`pill-btn ${tagsPanelOpen ? 'active' : ''}`} onClick={() => openOnly('tags')}>
          {iconSvg('label')} Tags
        </button>

        <div style={{ position: 'relative' }}>
          <button className="pill-btn" onClick={() => openOnly('settings')}>
            {iconSvg('settings')} Settings
          </button>
          {settingsOpen && (
            <div className="settings-menu">
              <button onClick={() => { onOpenShare(); setSettingsOpen(false); }}>{iconSvg('share')} Manage sharing</button>
              <button onClick={() => { onOpenTags(); setSettingsOpen(false); }}>{iconSvg('edit')} Edit tags</button>
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
