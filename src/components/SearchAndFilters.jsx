import { iconSvg } from '../lib/icons.jsx';

export default function SearchAndFilters({ floating, search, setSearch, tags, pins, activeFilters, toggleFilter, clearFilters, mapName }) {
  const counts = {};
  Object.keys(tags).forEach((k) => { counts[k] = pins.filter((p) => p.tags?.includes(k)).length; });


  return (
    <div className={`controls-block ${floating ? 'floating' : 'inline'}`}>
      <div className="searchpill">
        {iconSvg('search')}
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search on "${mapName}"…`} />
      </div>
      <div className="chiprow">
        <div className={`chip ${activeFilters.size === 0 ? 'active' : ''}`} onClick={clearFilters}>
          All ({pins.length})
        </div>
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
    </div>
  );
}
