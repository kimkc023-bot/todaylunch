import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, X, Plus } from 'lucide-react';

export interface OfficeLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const customDragIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  savedOffices: OfficeLocation[];
  activeOfficeId: string;
  onSelectOffice: (id: string) => void;
  onAddOffice: (loc: OfficeLocation) => void;
  onDeleteOffice: (id: string) => void;
}

const LocationSettingsModal: React.FC<Props> = ({ 
  isOpen, onClose, savedOffices, activeOfficeId, onSelectOffice, onAddOffice, onDeleteOffice 
}) => {
  const [mode, setMode] = useState<'list' | 'add'>('list');
  const [name, setName] = useState('');
  const [pinPos, setPinPos] = useState({ lat: 37.5133, lng: 127.0614 });

  useEffect(() => {
    if (isOpen) {
      setMode('list');
      // Set pin pos to active office as default starting point
      const active = savedOffices.find(o => o.id === activeOfficeId);
      if (active) {
        setPinPos({ lat: active.lat, lng: active.lng });
      }
      setName('');
    }
  }, [isOpen, savedOffices, activeOfficeId]);

  if (!isOpen) return null;

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('오피스(지역) 이름을 입력해주세요.');
      return;
    }
    const newOffice: OfficeLocation = {
      id: `office_${Date.now()}`,
      name,
      lat: pinPos.lat,
      lng: pinPos.lng
    };
    onAddOffice(newOffice);
    setMode('list');
  };

  const activeOffice = savedOffices.find(o => o.id === activeOfficeId);

  return (
    <div className="history-modal-overlay">
      <div className="history-panel glass-panel" style={{ maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="history-header">
          <h2 style={{ color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={22} /> 오피스 위치 설정</h2>
          <button type="button" className="close-btn" onClick={onClose} style={{ color: '#000', border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={24}/></button>
        </div>

        {mode === 'list' && (
          <div>
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: 0, marginBottom: '1rem' }}>
              점심을 먹을 오피스를 선택하세요. 저장된 오피스 간에 언제든 스위칭할 수 있습니다.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {savedOffices.map(o => {
                const isActive = o.id === activeOfficeId;
                return (
                  <li 
                    key={o.id} 
                    style={{ 
                      padding: '1rem', 
                      borderRadius: '12px', 
                      background: isActive ? 'rgba(255, 140, 0, 0.1)' : '#f8f9fa',
                      border: isActive ? '2px solid var(--primary-color)' : '1px solid #dee2e6',
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => {
                      if (!isActive) onSelectOffice(o.id);
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: isActive ? 'var(--primary-color)' : '#2c3e50' }}>{o.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginTop: '0.2rem' }}>
                        {isActive ? '✅ 현재 활성화된 오피스' : '터치하여 이 오피스로 변경'}
                      </div>
                    </div>

                    {!isActive && savedOffices.length > 1 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`'${o.name}' 항목을 삭제하시겠습니까?`)) {
                            onDeleteOffice(o.id);
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: '#e74c3c', fontSize: '0.8rem', cursor: 'pointer', padding: '0.5rem' }}
                      >
                        삭제
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            <button 
              onClick={() => setMode('add')}
              style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem', background: '#ecf0f1', color: '#2c3e50', border: '1px dashed #bdc3c7', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={18} /> 새로운 오피스 (지역) 추가하기
            </button>
          </div>
        )}

        {mode === 'add' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: 0 }}>
              새로운 오피스를 지도에 찍어주세요. 보라색 핀을 끌어다 놓으세요!
            </p>

            <div style={{ height: '220px', width: '100%', marginBottom: '1rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ccc', zIndex: 1 }}>
              <MapContainer key="map-add" center={[activeOffice?.lat || 37.5133, activeOffice?.lng || 127.0614]} zoom={15} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
                  <Popup>드래그하여 오피스를 지정하세요.</Popup>
                </Marker>
              </MapContainer>
            </div>
            
            <form onSubmit={handleSaveNew} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 600, color: '#34495e', fontSize: '0.9rem' }}>오피스 식별 이름</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="예: 판교오피스, 재택(집) 등"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #bdc3c7', color: '#2c3e50', background: 'rgba(255,255,255,0.9)' }}
                />
              </div>

              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setMode('list')} style={{ background: '#ecf0f1', color: '#7f8c8d', padding: '0.6rem 1.2rem', border: '1px solid #bdc3c7' }}>목록으로</button>
                <button type="submit" className="premium-select-btn" style={{ padding: '0.6rem 1.2rem', width: 'auto' }}>오피스 추가</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSettingsModal;
