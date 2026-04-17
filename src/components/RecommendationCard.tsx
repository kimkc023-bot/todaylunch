import React from 'react';
import type { Restaurant } from '../types';

interface Props {
  restaurant: Restaurant | null;
  onMarkEaten: () => void;
  spinning: boolean;
}

const RecommendationCard: React.FC<Props> = ({ restaurant, onMarkEaten, spinning }) => {
  if (spinning) {
    return (
      <div className="rec-card glass-panel spinning">
        <div className="spinner"></div>
        <p>오늘의 맛집을 찾는 중...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="rec-card glass-panel empty">
        <p>추천할 맛집이 없습니다. 새로고침 하거나 조건을 변경해보세요.</p>
      </div>
    );
  }

  return (
    <div className="rec-card glass-panel fade-in">
      <div className="card-header">
        <h2>{restaurant.name}</h2>
        {restaurant.isBlueRibbon && <span className="blue-ribbon-badge">🎀 블루리본</span>}
      </div>
      
      <div className="tags">
        <span className="tag category-tag">{restaurant.category}</span>
        <span className="tag walk-tag">🚶 도보 {restaurant.walkingTime}분</span>
      </div>

      <div className="menu-list">
        <h3>추천 메뉴</h3>
        <ul>
          {restaurant.menus.map((m, idx) => (
            <li key={idx}>
              <span className="menu-name">{m.name}</span>
              <span className="menu-price">{m.price?.toLocaleString()}원</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card-actions">
        <button onClick={onMarkEaten} className="eaten-btn">
          📍 오늘 여기 갈게요 (기록)
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
