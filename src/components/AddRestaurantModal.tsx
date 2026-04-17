import React, { useState, useEffect } from 'react';
import type { Restaurant } from '../types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

import { Star } from 'lucide-react';
import type { OfficeLocation } from './LocationSettingsModal';

interface Props {
  isOpen: boolean;
  initialData?: Restaurant;
  officeLoc: OfficeLocation;
  onClose: () => void;
  onAdd: (r: Restaurant) => void;
}

// Function to fix marker icon issue in react-leaflet with Vite
function fixLeafletIconInModal() {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

const customDragIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const AddRestaurantModal: React.FC<Props> = ({ isOpen, initialData, officeLoc, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [menu, setMenu] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [pinPos, setPinPos] = useState({ lat: officeLoc.lat, lng: officeLoc.lng });
  const [isFrequent, setIsFrequent] = useState(true);

  useEffect(() => {
    fixLeafletIconInModal();
  }, []);

  useEffect(() => {
    if (initialData && isOpen) {
      setName(initialData.name);
      setCategory(initialData.category);
      setMenu(initialData.menus?.[0]?.name || '');
      setPrice(initialData.menus?.[0]?.price || '');
      setPinPos({ lat: initialData.lat, lng: initialData.lng });
      setIsFrequent(initialData.isFrequent !== undefined ? initialData.isFrequent : true);
    } else if (!initialData && isOpen) {
      setPinPos({ lat: officeLoc.lat, lng: officeLoc.lng });
    }
  }, [initialData, isOpen, officeLoc.lat, officeLoc.lng]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) {
      alert('필수 값(식당 이름, 음식 종류)을 모두 입력해주세요.');
      return;
    }

    const newRestaurant: Restaurant = {
      id: initialData ? initialData.id : `custom_${Date.now()}`,
      name,
      category,
      isBlueRibbon: initialData ? initialData.isBlueRibbon : false,
      isFrequent: isFrequent,
      isCustom: true, // Mark heavily edited models as custom so they can be deleted
      lat: pinPos.lat,
      lng: pinPos.lng,
      weatherTags: initialData ? initialData.weatherTags : ['any'],
      menus: menu ? [{ name: menu, price: price === '' ? undefined : Number(price) }] : [],
    };

    onAdd(newRestaurant);
    
    // reset form
    setName('');
    setCategory('');
    setMenu('');
    setPrice('');
    setPinPos({ lat: officeLoc.lat, lng: officeLoc.lng });
    setIsFrequent(true);
    onClose();
  };

  return (
    <div className="history-modal-overlay">
      <div className="history-panel glass-panel" style={{ maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="history-header">
          <h2 style={{ color: 'var(--text-dark)' }}>{initialData ? '식당 핀/정보 수정' : '나만의 식당 직접 추가'}</h2>
          <button type="button" className="close-btn" onClick={onClose} style={{ color: '#000' }}>✕</button>
        </div>
        
        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: 0 }}>
          아래 지도에서 보라색 핀을 잡아당겨 실제 식당 위치로 끌어다 놓으세요! (거리에 비례해 도보 시간이 자동 계산됩니다)
        </p>

        {/* Mini Draggable Map */}
        <div style={{ height: '220px', width: '100%', marginBottom: '1rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ccc', zIndex: 1 }}>
          <MapContainer key={`loc-${isOpen}`} center={[officeLoc.lat, officeLoc.lng]} zoom={16} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* Draggable Marker */}
            <Marker 
              position={pinPos} 
              icon={customDragIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  setPinPos({ lat: position.lat, lng: position.lng });
                },
              }}
            >
              <Popup>핀을 길게 눌러 이동시키세요.</Popup>
            </Marker>
          </MapContainer>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 600, color: '#34495e', fontSize: '0.9rem' }}>식당 이름 *</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="예: 김밥천국 삼성점"
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #bdc3c7', color: '#2c3e50', background: 'rgba(255,255,255,0.9)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 600, color: '#34495e', fontSize: '0.9rem' }}>음식 종류 (카테고리) *</label>
            <input 
              type="text" 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              placeholder="예: 분식, 한식"
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #bdc3c7', color: '#2c3e50', background: 'rgba(255,255,255,0.9)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 600, color: '#34495e', fontSize: '0.9rem' }}>대표 메뉴명 (선택)</label>
              <input 
                type="text" 
                value={menu} 
                onChange={e => setMenu(e.target.value)} 
                placeholder="예: 참치김밥"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #bdc3c7', color: '#2c3e50', background: 'rgba(255,255,255,0.9)' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 600, color: '#34495e', fontSize: '0.9rem' }}>메뉴 가격 (선택)</label>
              <input 
                type="number" 
                value={price} 
                onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} 
                placeholder="예: 8000"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #bdc3c7', color: '#2c3e50', background: 'rgba(255,255,255,0.9)' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
             <input type="checkbox" checked={isFrequent} onChange={e => setIsFrequent(e.target.checked)} id="freq-check" style={{ width: '1.2rem', height: '1.2rem', accentColor: '#3498db' }} />
             <label htmlFor="freq-check" style={{ fontWeight: 600, color: '#34495e', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>단골로 지정하기 (<Star size={12} fill="#e74c3c" color="#e74c3c" /> 메뉴 추천 확률 상승)</label>
          </div>
          
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ background: '#ecf0f1', color: '#7f8c8d', padding: '0.6rem 1.2rem', border: '1px solid #bdc3c7' }}>취소</button>
            <button type="submit" className="premium-select-btn" style={{ padding: '0.6rem 1.2rem', width: 'auto' }}>지도 위치로 저장하기</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRestaurantModal;
