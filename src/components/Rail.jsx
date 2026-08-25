import { useEffect, useRef, useState } from 'react';
import { iconSvg } from '../lib/icons.jsx';
import MapPicker from './MapPicker.jsx';

export default function Rail({ view, setView, maps, currentMapId, onSwitchMap, onCreateMap, onOpenTags, onOpenShare, onSignOut }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const railRef = useRef(null);
  const currentMap = maps.find((m) => m.id === currentMapId);

  useEffect(() => {
    function onDocClick(e) {
      if (railRef.current && !railRef.current.contains(e.target)) setPickerOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <nav className="rail" ref={railRef}>
      <button className="brand" onClick={() => setPickerOpen((v) => !v)} title={currentMap?.name || 'Choose map'}>
        {iconSvg('place')}
      </button>
      {pickerOpen && (
        <MapPicker
          maps={maps}
          currentMapId={currentMapId}
          onSwitch={(id) => { onSwitchMap(id); setPickerOpen(false); }}
          onCreate={(name) => { onCreateMap(name); setPickerOpen(false); }}
        />
      )}

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
