import React from 'react';
import { Clock, MapPin, X, Trash2, Smile } from 'lucide-react';
import type { HistoryItem, Restaurant } from '../types';

interface Props {
  history: HistoryItem[];
  restaurants: Restaurant[];
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  onRemove: (id: string) => void;
}

const HistoryPanel: React.FC<Props> = ({ history, restaurants, isOpen, onClose, onClear, onRemove }) => {
  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const getRestaurantName = (id: string) => {
    const r = restaurants.find(x => x.id === id);
    return r ? r.name : '알 수 없는 식당';
  };

  return (
    <div className="history-modal-overlay" onClick={onClose}>
      <div className="history-panel glass-panel cursor-default" onClick={e => e.stopPropagation()}>
        <div className="history-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={20} /> 마이 런치 로그</h2>
          <button className="close-btn" onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={24} color="#555" /></button>
        </div>
        
        <p className="history-desc" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          최근 3일 내 달린 점심 메뉴는 룰렛에서 센스 있게 필터링해 드려요! <Smile size={16} /> 
        </p>

        {history.length === 0 ? (
          <div className="empty-history" style={{ color: 'var(--text-light)', textAlign: 'center', padding: '2rem' }}>
            아직 기록된 점심 로그가 없어요! 🥲
          </div>
        ) : (
          <ul className="history-list">
            {history.map(item => (
              <li key={item.id} className="history-item">
                <div className="history-info">
                  <strong style={{fontSize: '1.1rem', color: 'var(--primary-color)'}}>{item.menuName || getRestaurantName(item.restaurantId)}</strong>
                  <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {getRestaurantName(item.restaurantId)}</span>
                  <span className="date">{formatDate(item.date)}</span>
                </div>
                <button className="remove-item-btn" onClick={() => onRemove(item.id)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  기록 삭제
                </button>
              </li>
            ))}
          </ul>
        )}

        {history.length > 0 && (
          <div className="history-footer" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="clear-btn" onClick={onClear} style={{ background: 'var(--border-strong)', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trash2 size={16} /> 전체 로그 리셋
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
