import React from 'react';
import { Star, Plus, Footprints, Settings, Pencil, Trash2, X } from 'lucide-react';
import type { Restaurant } from '../types';

interface Props {
  restaurants: Restaurant[];
  isOpen: boolean;
  onClose: () => void;
  onToggle: (id: string) => void;
  onOpenAddModal: () => void;
  onDeleteCustom: (id: string) => void;
  onEdit?: (r: Restaurant) => void;
}

const FrequentManager: React.FC<Props> = ({ restaurants, isOpen, onClose, onToggle, onOpenAddModal, onDeleteCustom, onEdit }) => {
  if (!isOpen) return null;

  // Sort by walking time ascending (nearest first), with undefined treated as far
  const sorted = [...restaurants].sort((a, b) => (a.walkingTime ?? 99) - (b.walkingTime ?? 99));

  return (
    <div className="history-modal-overlay" onClick={onClose}>
      <div className="history-panel glass-panel cursor-default" onClick={e => e.stopPropagation()}>
        <div className="history-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={20} /> 나만의 단골 식당 관리</h2>
          <button className="close-btn" onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={24} color="#555" /></button>
        </div>
        
        <p className="history-desc" style={{ marginBottom: '0.5rem' }}>
          현재 선택된 <strong>오피스 기준 반경 1.5km 이내</strong>의 식당만 표시됩니다. 도보 시간은 현재 오피스 위치 기준으로 자동 계산됩니다.<br/>
          여기에 체크된 식당들은 나만의 단골 식당( <Star size={12} fill="#e74c3c" color="#e74c3c" style={{ display: 'inline-block' }} /> )으로 표시되며, 
          점심 추천 시 무려 <strong>80%의 높은 확률</strong>로 우선 추천됩니다!
        </p>
        
        <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
          <button onClick={onOpenAddModal} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={16} /> 새로운 식당 직접 등록하기
          </button>
        </div>

        <ul className="history-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {sorted.map(r => (
            <li key={r.id} className="history-item">
              <div className="history-info">
                <strong>{r.name} {r.isCustom && <span style={{fontSize: '0.75rem', color: '#888'}}>(직접 추가함)</span>}</strong>
                <span className="date" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Footprints size={12} /> {r.category} | 도보 {r.walkingTime != null ? `${r.walkingTime}분` : '계산 중...'}
                </span>
              </div>
              <div className="list-item-actions" style={{ display: 'flex', alignItems: 'center' }}>
                {onEdit && (
                  <button className="edit-btn" onClick={() => onEdit(r)} style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', background: '#ecf0f1', color: 'var(--text-main)', border: 'none', marginRight: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Pencil size={12} /> 수정
                  </button>
                )}
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.3rem', marginRight: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={!!r.isFrequent} 
                    onChange={() => onToggle(r.id)} 
                    style={{ width: '1.2rem', height: '1.2rem', accentColor: '#e74c3c' }}
                  />
                  단골
                </label>
                {onDeleteCustom && r.isCustom && (
                  <button 
                    onClick={() => onDeleteCustom(r.id)}
                    style={{ background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={12} /> 삭제
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
};

export default FrequentManager;
