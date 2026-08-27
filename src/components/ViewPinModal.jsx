import { useEffect, useState } from 'react';
import { iconSvg } from '../lib/icons.jsx';
import { loadGoogleMaps } from '../lib/googleMaps.js';

function GoogleTab({ pin }) {
  const [details, setDetails] = useState(null);
  const [status, setStatus] = useState(pin.placeId ? 'loading' : 'none');

  useEffect(() => {
    if (!pin.placeId) { setStatus('none'); return; }
    let cancelled = false;
    setStatus('loading');
    loadGoogleMaps()
      .then(async ({ Place }) => {
        const place = new Place({ id: pin.placeId });
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'rating', 'userRatingCount',
                    'regularOpeningHours', 'internationalPhoneNumber', 'photos'],
        });
        if (cancelled) return;
        setDetails(place);
        setStatus('ok');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => { cancelled = true; };
  }, [pin.placeId]);

  if (status === 'none') {
    return <div className="oembed-hint">This pin isn't linked to a Google Place yet — add one via the address field when editing.</div>;
  }
  if (status === 'loading') return <div className="oembed-hint">Loading from Google…</div>;
  if (status === 'error') return <div className="oembed-hint">Couldn't load Google details — check VITE_GOOGLE_MAPS_API_KEY and that the Places API is enabled.</div>;

  const photoUrls = (details.photos || []).slice(0, 4).map((p) => p.getURI({ maxWidth: 300 }));

  return (
    <div>
      {photoUrls.length > 0 && (
        <>
          <div className="photo-row">
            {photoUrls.map((src) => <img key={src} src={src} alt="" className="photo-ph" style={{ objectFit: 'cover' }} />)}
          </div>
          <div className="photo-caption">Photos load live from Google — nothing's stored in Mappin.</div>
        </>
      )}
      <div className="field"><label>⭐ Google rating</label><div>{details.rating ? `${details.rating} (${details.userRatingCount ?? 0} reviews)` : 'Not available'}</div></div>
      <div className="field"><label>🕒 Hours</label><div>{details.regularOpeningHours?.weekdayDescriptions?.join(', ') || 'Not available'}</div></div>
      <div className="field"><label>📞 Contact</label><div>{details.internationalPhoneNumber || 'Not available'}</div></div>
    </div>
  );
}

export default function ViewPinModal({ pin, tags, addedByLabel, onClose, onEdit, onDelete }) {
  const [tab, setTab] = useState('details');
  if (!pin) return null;

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
  <div className="modal-head">
    <h2>{pin.name}</h2>
    <button className="icon-btn" onClick={onClose}>{iconSvg('close')}</button>
  </div>

  <div className="modal-body">

    {/* Address goes here */}
    {pin.address && (
      <div style={{ fontSize: 13, color: 'var(--on-surface-var)', margin: '4px 0 12px' }}>
        {pin.address}
      </div>
    )}

    {/* Tabs go here */}
    <div className="tabbar">
      <div className={`tab ${tab === 'details' ? 'active' : ''}`} onClick={() => setTab('details')}>Mappin</div>
      <div className={`tab ${tab === 'google' ? 'active' : ''}`} onClick={() => setTab('google')}>Google</div>
    </div>

    {/* Details tab */}
    {tab === 'details' && (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          {pin.rating > 0 ? (
            <div className="stars">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} viewBox="0 0 24 24" className={i <= pin.rating ? 'star-filled' : 'star-empty'}>
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
          ) : (
            <span className="not-visited">Not visited yet</span>
          )}
        </div>

        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>
          Added by {addedByLabel(pin.addedBy)}
        </div>

        {pin.note && (
          <div className="note" style={{ marginBottom: 10 }}>
            {pin.note}
          </div>
        )}

        <div className="tagchips" style={{ marginTop: 12 }}>
          {pin.tags?.map((k) => tags[k] && (
            <span key={k} className="tagchip" style={{ background: tags[k].bg, color: tags[k].color }}>
              {tags[k].emoji} {tags[k].label}
            </span>
          ))}
        </div>

        {pin.url && (
          <button className="btn btn-tonal" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }} onClick={() => window.open(pin.url, '_blank')}>
            {iconSvg('link')} Open link
          </button>
        )}
      </div>
    )}

       {/* Google tab */}
    {tab === 'google' && <GoogleTab pin={pin} />}

  </div> {/* end modal-body */}

  <div className="modal-actions">
    <button className="btn-danger-text" onClick={onDelete}>Delete</button>
    <div style={{ flex: 1 }} />
    <button className="btn-text" onClick={onEdit}>Edit</button>
    <button className="btn btn-primary" onClick={onClose}>Close</button>
  </div>

</div>
</div>
);
}

