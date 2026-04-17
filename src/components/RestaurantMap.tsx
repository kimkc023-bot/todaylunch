import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Restaurant, MealCandidate } from '../types';

interface Props {
  restaurants: Restaurant[];
  recommendedMeals: MealCandidate[];
  centerLat: number;
  centerLng: number;
}


const MapUpdater: React.FC<{ meals: MealCandidate[], centerLat: number, centerLng: number }> = ({ meals, centerLat, centerLng }) => {
  const map = useMap();
  useEffect(() => {
    if (meals.length > 0) {
      const bounds = L.latLngBounds([[centerLat, centerLng]]);
      meals.forEach(m => bounds.extend([m.restaurant.lat, m.restaurant.lng]));
      map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 17, duration: 1.5 });
    } else {
      map.flyTo([centerLat, centerLng], 16, { duration: 1.5 });
    }
  }, [meals, centerLat, centerLng, map]);
  return null;
};

// CSS-based Monochrome dot markers replacing PNGs
const dotIcon = (type: 'primary' | 'dark' | 'grey') => {
  return L.divIcon({
    html: `<div class="mono-dot ${type}"></div>`,
    className: '', // strip default styles
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const RestaurantMap: React.FC<Props> = ({ restaurants, recommendedMeals, centerLat, centerLng }) => {
  
  const groupedRecommendations = useMemo(() => {
    const acc: Record<string, { restaurant: Restaurant, ranks: (number|string)[], menus: string[] }> = {};
    recommendedMeals.forEach((meal, idx) => {
      const rank = idx === 3 ? '도전' : idx + 1;
      const rId = meal.restaurant.id;
      if (!acc[rId]) {
        acc[rId] = { restaurant: meal.restaurant, ranks: [], menus: [] };
      }
      acc[rId].ranks.push(rank);
      const prefix = rank === '도전' ? '[오늘의 도전]' : `[${rank}위]`;
      if (meal.menu) {
        acc[rId].menus.push(`${prefix} ${meal.menu.name}`);
      } else {
        acc[rId].menus.push(`${prefix} 식당 방문`);
      }
    });
    return Object.values(acc);
  }, [recommendedMeals]);

  const createRankIcon = (ranks: (number|string)[]) => {
    const text = ranks.includes('도전') ? '🚀' : ranks.join(','); 
    const isFirst = ranks.includes(1);
    const className = isFirst ? 'rank-marker first-place' : 'rank-marker';
    return L.divIcon({
      html: `<div>${text}</div>`,
      className: className,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });
  };

  return (
    <div className="map-container">
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={16} 
        style={{ height: '460px', width: '100%' }}
      >
        <MapUpdater meals={recommendedMeals} centerLat={centerLat} centerLng={centerLng} />
        
        {/* Detailed map to solve 'too simple' feedback, muted via global CSS filter */}
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        <Marker position={[centerLat, centerLng]} icon={dotIcon('dark')}>
          <Tooltip permanent direction="top" className="map-label office" offset={[0, -10]}>
            현대아이파크타워
          </Tooltip>
          <Popup><strong>오피스</strong></Popup>
        </Marker>

        {recommendedMeals.length === 0 ? (
          restaurants.map(r => (
            <Marker key={r.id} position={[r.lat, r.lng]} icon={r.isFrequent ? dotIcon('primary') : dotIcon('grey')}>
              <Tooltip permanent direction="top" className="map-label default-rest" offset={[0, -10]}>
                {r.name}
              </Tooltip>
              <Popup>
                <strong style={{color: 'var(--text-dark)'}}>{r.name}</strong> 
                <br /> <span style={{fontSize:'0.85rem', color: 'var(--text-muted)'}}>{r.category}</span>
              </Popup>
            </Marker>
          ))
        ) : (
          groupedRecommendations.map((gr, idx) => (
            <Marker key={idx} position={[gr.restaurant.lat, gr.restaurant.lng]} icon={createRankIcon(gr.ranks)}>
              <Tooltip permanent direction="right" className={`map-label ${gr.ranks.includes(1) ? 'first-place-label' : ''}`} offset={[15, 0]}>
                {gr.restaurant.name}
              </Tooltip>
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <strong style={{color:'var(--text-dark)'}}>{gr.restaurant.name}</strong>
                  <br />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{gr.restaurant.category}</span>
                </div>
                <hr style={{ margin: '5px 0', borderColor: 'var(--border-light)', borderStyle: 'solid' }}/>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {gr.menus.map((m, i) => (
                    <li key={i} style={{ marginBottom: '3px' }}><strong>{m}</strong></li>
                  ))}
                </ul>
              </Popup>
            </Marker>
          ))
        )}
        {/* Office Location Marker */}
        <Marker position={[centerLat, centerLng]} icon={dotIcon('dark')}>
          <Tooltip direction="top" offset={[0, -10]} opacity={1}>오피스 위치</Tooltip>
        </Marker>

      </MapContainer>

      {/* Legend rendered as an absolute overlay inside map-container */}
      <div style={{
        position: 'absolute', top: 10, right: 10, zIndex: 1000,
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
        borderRadius: '10px', padding: '0.4rem 0.8rem',
        display: 'flex', flexDirection: 'column', gap: '4px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.72rem',
        fontWeight: 600, color: '#334155'
      }}>
        {recommendedMeals.length === 0 ? (
          <>
            <span className="legend-item"><div className="mono-dot dark"></div> 오피스</span>
            <span className="legend-item"><div className="mono-dot primary"></div> 단골</span>
            <span className="legend-item"><div className="mono-dot grey"></div> 일반</span>
          </>
        ) : (
          <>
            <span className="legend-item"><div className="mono-dot dark"></div> 오피스</span>
            <span className="legend-item"><span className="rank-legend-dot" style={{background: 'var(--text-dark)'}}></span> 1위</span>
            <span className="legend-item"><span className="rank-legend-dot" style={{background: 'var(--card-bg)'}}></span> 2~3위</span>
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantMap;
