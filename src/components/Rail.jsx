import { iconSvg } from '../lib/icons.jsx';

export default function Rail({ view, setView, onOpenTags, onOpenShare, onSignOut }) {
  return (
    <nav className="rail">
      <div className="brand">{iconSvg('place')}</div>
      <button className={`rail-item ${view === 'map' ? 'active' : ''}`} onClick={() => setView('map')}>
        {iconSvg('map')}Map
      </button>
      <button className={`rail-item ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
        {iconSvg('view_list')}Pins
      </button>
      <button className="rail-item" onClick={onOpenTags}>{iconSvg('label')}Tags</button>
      <button className="rail-item" onClick={onOpenShare}>{iconSvg('share')}Shared</button>
      <div className="rail-spacer" />
      <button className="rail-item" onClick={onSignOut}>{iconSvg('logout')}Sign out</button>
    </nav>
  );
}
