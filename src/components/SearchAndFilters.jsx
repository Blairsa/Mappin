import { iconSvg } from '../lib/icons.jsx';

export default function SearchAndFilters({
  floating,
  search,
  setSearch,
  tags,
  pins,
  activeFilters,
  toggleFilter,
  clearFilters,
  mapName,
  setView,
  onOpenTags,
  onOpenShare,
  onZoomToCities
}) {
  const counts = {};
  Object.keys(tags).forEach((k) => {
    counts[k] = pins.filter((p) => p.tags?.includes(k)).length;
  });

  return (
    <div className={`controls-block ${floating ? 'floating' : 'inline'}`}>

      {/* Material 3 small search bar */}
      <div className="searchpill searchpill-sm">
        {iconSvg('search')}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search on "${mapName}"…`}
        />
      </div>

      {/* Material 3 toolbar */}
      <div className="m3-toolbar">

        <button
          className="m3-tool"
          onClick={() => setView('map')}
        >
          {iconSvg('map')}
          <span>Map</span>
        </button>

        <button
          className="m3-tool"
          onClick={() => onZoomToCities?.()}
        >
          {iconSvg('place')}
          <span>{pins.length} Cities</span>
        </button>

        <button
          className="m3-tool"
          onClick={onOpenTags}
        >
          {iconSvg('label')}
          <span>Tags</span>
        </button>

        <button
          className="m3-tool"
          onClick={onOpenShare}
        >
          {iconSvg('settings')}
          <span>Settings</span>
        </button>

      </div>

      {/* Tag chips */}
      <div className="chiprow">
        <div
          className={`chip ${activeFilters.size === 0 ? 'active' : ''}`}
          onClick={clearFilters}
        >
          All ({pins.length})
        </div>

        {Object.entries(tags).map(([key, t]) => {
          if (!counts[key]) return null;
          return (
            <div
              key={key}
              className={`chip ${activeFilters.has(key) ? 'active' : ''}`}
              onClick={() => toggleFilter(key)}
            >
              <span className="dot" style={{ background: t.color }} />
              {t.emoji} {t.label} ({counts[key]})
            </div>
          );
        })}
      </div>

    </div>
  );
}
