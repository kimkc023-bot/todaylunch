import React from 'react';
import type { MealCandidate } from '../types';

interface Props {
  meals: MealCandidate[];
  onMarkEaten: (m: MealCandidate) => void;
  spinning: boolean;
}

const RecommendationList: React.FC<Props> = ({ meals, onMarkEaten, spinning }) => {
  if (spinning) {
    return (
      <div className="premium-rec-board" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', gap: '1rem' }}>
        <div className="dice-cube-container">
          <div className="dice-cube">
            <div className="dice-face front"><div className="dot"></div></div>
            <div className="dice-face back"><div className="dot"></div><div className="dot"></div></div>
            <div className="dice-face right"><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
            <div className="dice-face left"><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
            <div className="dice-face top"><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
            <div className="dice-face bottom"><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-main)', margin: '0 0 0.8rem 0', animation: 'pulse 1.2s infinite' }}>
            점심 가챠를 돌리는 중입니다...!
          </p>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>위성 스캔 중 📡 (최대 5초 소요)</span>
        </div>
      </div>
    );
  }

  if (!meals || meals.length === 0) {
    return (
      <div className="premium-rec-board" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>추천할 메뉴가 없습니다. 새로고침 하거나 최근 식사 기록을 비워보세요.</p>
      </div>
    );
  }

  const firstPlace = meals[0];
  const runnersUp = meals.slice(1);

  const getWalkTime = (m: MealCandidate) => {
    if (m.restaurant.walkingTime !== undefined) return m.restaurant.walkingTime;
    if (m.calculatedDistance !== undefined) {
      const realDist = m.calculatedDistance * 1.35; // Manhattan distance approx
      return Math.ceil(realDist / 70); // Walking speed: 70m/min
    }
    return '?';
  };

  return (
    <div className="premium-rec-board fade-in">
      <h2 style={{ textAlign: 'center', margin: '0 0 0.5rem 0', fontSize: '1.4rem', color: 'var(--text-muted)', fontWeight: 600 }}>오늘의 랭킹 결과</h2>

      {/* 1st Place Hero Card */}
      <div className="premium-first-place">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }}>1위</span>
              <h3 className="premium-first-title" style={{ margin: 0, wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                {firstPlace.menu?.name || firstPlace.restaurant.name}
              </h3>
            </div>
            
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>
              {firstPlace.restaurant.name} 
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <span className="tag neutral">{firstPlace.restaurant.category}</span>
              <span className="tag neutral">도보 {getWalkTime(firstPlace)}분</span>
              {firstPlace.isFrequent ? 
                <span className="tag frequent">단골</span> : 
                <span className="tag rare">새로운 발견</span>
              }
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {firstPlace.menu?.price != null && (
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  {Number(firstPlace.menu.price).toLocaleString()}원
                </div>
              )}
              
              <div>
                 <a href={`https://map.naver.com/p/search/${encodeURIComponent('삼성동 ' + firstPlace.restaurant.name)}`} target="_blank" rel="noreferrer" style={{color: '#00c73c', fontWeight: '800', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', padding: '0.2rem 0.6rem', border: '1px solid #00c73c', borderRadius: '4px'}}>🔍 네이버 플레이스로 즉시 확인하기</a>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>[ 알고리즘 {firstPlace.score}점 ]</strong>
              {firstPlace.buffs?.map((buff, i) => (
                <span key={i} style={{ fontSize: '0.8rem', background: '#e2e8f0', color: '#475569', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{buff}</span>
              ))}
            </div>
          </div>
          
          <button onClick={() => onMarkEaten(firstPlace)} className="premium-select-btn dark" style={{ alignSelf: 'flex-end', padding: '0.8rem 1.5rem', fontSize: '1.05rem' }}>
            점심 메뉴로 결정
          </button>
        </div>
      </div>

      {/* Runners up List */}
      {runnersUp.length > 0 && (
        <div className="premium-runners-grid">
          {runnersUp.map((m, idx) => (
            <div key={m.id} className="premium-runner-up">
              
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div style={{ 
                  fontWeight: idx === 2 ? '900' : '800', 
                  fontSize: idx === 2 ? '1.1rem' : '1.4rem', 
                  color: idx === 2 ? '#f39c12' : 'var(--text-light)', 
                  minWidth: '20px', 
                  textAlign: 'center' 
                }}>
                  {idx === 2 ? '도전' : idx + 2}
                </div>
                
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.menu?.name || m.restaurant.name}</span>
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                      {idx === 2 ? 
                        <span style={{fontSize: '0.8rem', color: '#f39c12', fontWeight: 800}}>• 🚀</span> :
                        (m.isFrequent ? <span style={{fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800}}>• 단골</span> : <span style={{fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800}}>• 신규</span>)
                      }
                    </div>
                  </strong>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px', flexShrink: 1 }}>{m.restaurant.name}</span>
                    <span style={{ flexShrink: 0 }}>|</span>
                    <span style={{ flexShrink: 0 }}>{m.restaurant.category}</span>
                    <span style={{ flexShrink: 0 }}>|</span>
                    <span style={{ flexShrink: 0 }}>도보 {getWalkTime(m)}분</span>
                    {m.menu?.price != null && (
                      <>
                        <span>|</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{Number(m.menu.price).toLocaleString()}원</span>
                      </>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-light)', border: '1px solid var(--border-light)', padding: '0.1rem 0.2rem', borderRadius: '4px' }}>[{m.score}점]</span>
                    {m.buffs?.map((buff, i) => (
                       <span key={i} style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '0.1rem 0.2rem', borderRadius: '4px' }}>{buff}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end', marginLeft: 'auto' }}>
                <a href={`https://map.naver.com/p/search/${encodeURIComponent('삼성동 ' + m.restaurant.name)}`} target="_blank" rel="noreferrer" style={{ color: '#00c73c', fontWeight: 800, textDecoration: 'none', fontSize: '0.75rem', border: '1px solid #00c73c', padding: '0.2rem 0.4rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                  🔍 플레이스
                </a>
                <button onClick={() => onMarkEaten(m)} className="premium-select-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                  선택
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default RecommendationList;
