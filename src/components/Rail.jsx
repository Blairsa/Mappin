import { iconSvg } from '../lib/icons.jsx';

// Map switching, tag editing, and sharing now live in the map toolbar —
// the rail is just view-type navigation (map vs list) plus sign out.
export default function Rail({ view, setView, onSignOut }) {
  return (
    <nav className="rail">
      <div className="brand">{iconSvg('place')}</div>

      <button className={`rail-item ${view === 'map' ? 'active' : ''}`} onClick={() => setView('map')}>
        {iconSvg('map')}Map
      </button>
      <button className={`rail-item ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
        {iconSvg('view_list')}Pins
      </button>
      <div className="rail-spacer" />
      <button className="rail-item" onClick={onSignOut}>{iconSvg('logout')}Sign out</button>
    </nav>
  );
}
