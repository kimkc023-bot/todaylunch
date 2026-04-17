import { useState, useEffect } from 'react';
import './App.css';
import type { Restaurant, MealCandidate, WeatherData, HistoryItem } from './types';
import { RESTAURANTS } from './data/restaurants';
import { fetchWeather } from './services/weatherService';
import { getHistory, addHistory, clearHistory, removeHistoryItem, isRecentlyEaten } from './services/historyService';
import { getFrequentIds, toggleFrequent } from './services/frequentService';
import { getCustomRestaurants, addCustomRestaurant, removeCustomRestaurant } from './services/customRestaurantService';
import WeatherWidget from './components/WeatherWidget';
import RecommendationList from './components/RecommendationList';
import HistoryPanel from './components/HistoryPanel';
import RestaurantMap from './components/RestaurantMap';
import FrequentManager from './components/FrequentManager';
import AddRestaurantModal from './components/AddRestaurantModal';
import LocationSettingsModal from './components/LocationSettingsModal';
import type { OfficeLocation } from './components/LocationSettingsModal';
import { MapPin, Star, Clock, Dices } from 'lucide-react';

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const defaultOffice = { id: 'default', name: '삼성동 아이파크타워', lat: 37.5133, lng: 127.0614 };
  const [savedOffices, setSavedOffices] = useState<OfficeLocation[]>([defaultOffice]);
  const [activeOfficeId, setActiveOfficeId] = useState<string>('default');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const officeLoc = savedOffices.find(o => o.id === activeOfficeId) || savedOffices[0] || defaultOffice;
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [frequentIds, setFrequentIdsState] = useState<string[]>([]);
  const [customRestaurants, setCustomRestaurants] = useState<Restaurant[]>([]);

  const [isFrequentManagerOpen, setIsFrequentManagerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | undefined>(undefined);
  
  const [recommendedMeals, setRecommendedMeals] = useState<MealCandidate[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    const legacy = localStorage.getItem('lunch_office_location');
    const savedOffList = localStorage.getItem('lunch_saved_offices');
    const savedActiveId = localStorage.getItem('lunch_active_office_id');

    if (savedOffList) {
      try {
        const initialOffices = JSON.parse(savedOffList);
        setSavedOffices(initialOffices);
        if (savedActiveId && initialOffices.some((o: OfficeLocation) => o.id === savedActiveId)) {
          setActiveOfficeId(savedActiveId);
        } else {
          setActiveOfficeId(initialOffices[0].id);
        }
      } catch(e) {}
    } else if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        const migrated: OfficeLocation = { id: `legacy_${Date.now()}`, name: parsed.name, lat: parsed.lat, lng: parsed.lng };
        setSavedOffices([migrated]);
        setActiveOfficeId(migrated.id);
        localStorage.setItem('lunch_saved_offices', JSON.stringify([migrated]));
        localStorage.setItem('lunch_active_office_id', migrated.id);
      } catch(e) {}
    }

    setHistory(getHistory());
    setFrequentIdsState(getFrequentIds());
    setCustomRestaurants(getCustomRestaurants());
  }, []);

  useEffect(() => {
    setWeatherLoading(true);
    fetchWeather(officeLoc.lat, officeLoc.lng).then(data => {
      setWeather(data);
      setWeatherLoading(false);
    });
  }, [officeLoc.lat, officeLoc.lng]);

  const refreshHistory = () => {
    setHistory(getHistory());
  };

  const handleToggleFrequent = (id: string) => {
    const updated = toggleFrequent(id);
    setFrequentIdsState(updated);
  };

  const handleAddCustomRestaurant = (r: Restaurant) => {
    const updatedCustom = addCustomRestaurant(r);
    setCustomRestaurants(updatedCustom);
    if (!frequentIds.includes(r.id)) {
      const updatedFrequent = toggleFrequent(r.id);
      setFrequentIdsState(updatedFrequent);
    }
  };

  const handleDeleteCustomRestaurant = (id: string) => {
    if (confirm('정말로 이 식당을 삭제하거나 기본값으로 되돌리시겠습니까?')) {
      const updated = removeCustomRestaurant(id);
      setCustomRestaurants(updated);
    }
  };

  const openEditModal = (r: Restaurant) => {
    setEditingRestaurant(r);
    setIsAddModalOpen(true);
  };

  const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Base restaurants overshadowed by custom edits
  const allRestaurants = RESTAURANTS.map(base => {
    const customOverride = customRestaurants.find(c => c.id === base.id);
    return customOverride || base;
  }).concat(customRestaurants.filter(c => !RESTAURANTS.some(b => b.id === c.id)));

  const dynamicRestaurants = allRestaurants.map(r => {
    const lat = typeof r?.lat === 'number' && !isNaN(r.lat) ? r.lat : officeLoc.lat;
    const lng = typeof r?.lng === 'number' && !isNaN(r.lng) ? r.lng : officeLoc.lng;
    const dist = getDistanceInMeters(officeLoc.lat, officeLoc.lng, lat, lng);
    // 60m/min walking speed, 1.4 urban Manhattan factor, +4min building exit overhead, min 5min
    const rawWalk = Math.ceil((dist * 1.4) / 60);
    const walkingTime = Math.max(5, rawWalk + 4);

    return {
      ...r,
      name: typeof r?.name === 'string' ? r.name : '이름 미상',
      category: typeof r?.category === 'string' ? r.category : '기타',
      weatherTags: (Array.isArray(r?.weatherTags) ? r.weatherTags : (typeof r?.weatherTags === 'string' ? [r.weatherTags] : ['any'])) as any,
      menus: Array.isArray(r?.menus) ? r.menus : [],
      lat,
      lng,
      walkingTime,
      isFrequent: r?.id ? frequentIds.includes(r.id) : false
    };
  });

  const fetchOverpassRestaurant = async (maxDist: number) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5초 내 응답 없으면 타임아웃 강제 취소
    try {
      const query = `[out:json];node["amenity"~"restaurant|fast_food"]["name"!~"주막|주점|호프|포차|비어|펍|라운지|양꼬치|술집|포장마차|주류|바|맥주|브루어리|백세주"](around:${maxDist},${officeLoc.lat},${officeLoc.lng});out;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await res.json();
      const nodes = data.elements.filter((e: any) => e.tags && e.tags.name);
      return nodes;
    } catch(e) {
      clearTimeout(timeoutId);
      return []; // 타임아웃이나 에러 시 조용히 빈 배열 던짐 (무한 멈춤 방지)
    }
  };

  const spin = () => {
    setIsSpinning(true);
    
    // We execute async fetch inside the timeout to allow UI to show 'spinning...' state gracefully
    setTimeout(async () => {
      const isBadWeather = weather?.isRaining;
      const maxDist = isBadWeather ? 300 : 800; // 비올때는 오직 300m 이내만

      // 1. Filter spatially accessible restaurants and map distance
      const inRangeRestaurants = dynamicRestaurants.map(r => {
        const dist = getDistanceInMeters(officeLoc.lat, officeLoc.lng, r.lat, r.lng);
        return { ...r, calculatedDistance: Math.round(dist) };
      }).filter(r => r.calculatedDistance <= maxDist);

      // Analyze Category Fatigue (Last 7 Days)
      const last7Days = new Date().getTime() - (7 * 24 * 60 * 60 * 1000);
      const recentHistory = history.filter(h => new Date(h.date).getTime() > last7Days);
      const categoryCounts: Record<string, number> = {};
      recentHistory.forEach(h => {
        const r = dynamicRestaurants.find(dr => dr.id === h.restaurantId);
        if (r && r.category) {
          categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
        }
      });

      // 2. Expand into Meal Candidates
      const allMeals: MealCandidate[] = [];
      inRangeRestaurants.forEach(r => {
        if (!r.menus || r.menus.length === 0) {
          allMeals.push({
            id: r.id,
            restaurant: r,
            menu: undefined,
            isFrequent: !!r.isFrequent,
            calculatedDistance: r.calculatedDistance
          });
        } else {
          r.menus.forEach(m => {
            allMeals.push({
              id: `${r.id}_${m.name}`,
              restaurant: r,
              menu: m,
              isFrequent: !!r.isFrequent,
              calculatedDistance: r.calculatedDistance
            });
          });
        }
      });

      // API Request to get fresh un-added restaurants
      let overpassMeal: MealCandidate | null = null;
      try {
        const nodes = await fetchOverpassRestaurant(maxDist);
        // Filter out names we already know (including franchise variations like "써브웨이 삼성점" vs "써브웨이 봉은사점")
        const newNodes = nodes.filter((n: any) => {
          const stripBranch = (str: string) => str.replace(/\s+.*점$/, '').replace(/(삼성|봉은사|코엑스|파르나스|강남|본).*점$/, '').replace(/\s+/g, '');
          const apiBase = stripBranch(n.tags.name);
          return !dynamicRestaurants.some(r => {
            const dbBase = stripBranch(r.name);
            return apiBase === dbBase || apiBase.includes(dbBase) || dbBase.includes(apiBase);
          });
        });
        if (newNodes.length > 0) {
          const randNode = newNodes[Math.floor(Math.random() * newNodes.length)];
          const distToNode = getDistanceInMeters(officeLoc.lat, officeLoc.lng, randNode.lat, randNode.lon);
          
          const mysteryHints = [
            '가서 직접 확인해볼까요?', '무슨 메뉴가 숨어있을까', '오늘의 신규 출현!', 
            '숨은 맛집 스멜', '미지로 모험을 떠나볼까요', '동료들을 이끌고 돌격!'
          ];
          let menuHint = mysteryHints[Math.floor(Math.random() * mysteryHints.length)];
          if (randNode.tags.cuisine) {
            const cMap: Record<string, string> = {
              korean: '한식', japanese: '일식', chinese: '중식', italian: '이탈리안', 
              burger: '햄버거', pizza: '피자', chicken: '치킨', noodle: '면요리', 
              sushi: '초밥', pork: '돼지고기', beef: '소고기', vietnamese: '베트남 음식', 
              thai: '태국 음식', seafood: '해산물', mexican: '멕시칸', indian: '커리',
              sandwich: '샌드위치', barbecue: '고기구이(BBQ)', steak_house: '스테이크'
            };
            const cRaw = randNode.tags.cuisine.split(';')[0].toLowerCase();
            const translated = cMap[cRaw] || cRaw.toUpperCase();
            menuHint = `[${translated}] 메인 요리`;
          }

          overpassMeal = {
            id: `op_${randNode.id}`,
            restaurant: {
              id: `op_${randNode.id}`,
              name: randNode.tags.name,
              category: '오늘의 도전',
              isBlueRibbon: false,
              lat: randNode.lat,
              lng: randNode.lon,
              walkingTime: Math.ceil((distToNode * 1.35) / 50),
              weatherTags: ['any'],
              menus: []
            },
            menu: { name: menuHint },
            isFrequent: false,
            calculatedDistance: Math.round(distToNode),
            score: 99.9,
            buffs: ['✨ 신규 식당', '📡 위성 탐지']
          };
        }
      } catch (e) {
        console.error("Overpass fetch failed", e);
      }

      // 3. Filter by recently eaten
      let availableMeals = allMeals.filter(m => {
        // 비가 올 때는 가까운게 장땡이므로(300m 제한) 최근 3일 내에 먹었든 말든 후보에 무조건 포함시킵니다.
        if (isBadWeather) return true;
        return !isRecentlyEaten(m.restaurant.id, m.menu?.name, history);
      });

      // 강제 폴백: 만약 3일 내 식사 기록 필터링 때문에 남은 후보가 0개가 되었다면,
      // 앱을 먹통(다운) 시키지 않고 식사 기록을 무시하고 전체 범위에서 다시 추천을 돌립니다.
      if (availableMeals.length === 0 && allMeals.length > 0) {
        availableMeals = [...allMeals];
      }

      if (availableMeals.length === 0) {
        alert(`❌ 추천할 메뉴가 없습니다!\n(식당 데이터베이스에 이 근처 식당이 아예 없습니다.)`);
        setRecommendedMeals([]);
        setIsSpinning(false);
        return;
      }

      const frequentPool = availableMeals.filter(c => c.isFrequent);
      const infrequentPool = availableMeals.filter(c => !c.isFrequent);

      // Weight Assignment Logic
      const rankPool = (pool: MealCandidate[], isFreqProp: boolean) => pool.map(c => {
        let weight = 1;
        let buffs: string[] = isFreqProp ? ['⭐ 단골 식당'] : ['✨ 신규 식당'];
        
        if (weather && c.restaurant.weatherTags) {
          if (c.restaurant.weatherTags.includes(weather.condition)) {
            weight += 0.4;
            buffs.push('☔ 날씨 찰떡');
          } else if (c.restaurant.weatherTags.includes('any')) {
            weight += 0.1;
            buffs.push('🌤️ 날씨 무관');
          }
        }

        // Distance Proximity Bonus
        if (c.calculatedDistance !== undefined && c.calculatedDistance < 200) {
          weight += 0.4;
          buffs.push('🏃 초근접지');
        }

        // Category Fatigue Penalty/Bonus
        const catCount = categoryCounts[c.restaurant.category] || 0;
        if (catCount >= 3) {
          weight -= 0.8;
          buffs.push(`📉 종류 과다`);
        } else if (catCount > 0) {
          weight -= 0.3;
          buffs.push(`🤔 중복 메뉴`);
        } else {
          weight += 0.3;
          buffs.push(`✨ 기분 전환`);
        }

        const price = c.menu?.price;
        if (price !== undefined) {
          const curveBonus = Math.exp(-Math.pow(price - 10000, 2) / (2 * Math.pow(4000, 2)));
          weight += curveBonus * 1.5; 
          if (curveBonus > 0.8) buffs.push('💰 극강 가성비');
          else if (curveBonus > 0.4) buffs.push('💵 가성비 굿');
        } else {
          const curveBonus = Math.exp(-Math.pow(9000 - 10000, 2) / (2 * Math.pow(4000, 2)));
          weight += curveBonus * 1.5;
          buffs.push('👀 가격 미상');
        }

        const randomBuff = Math.random() * 0.5;
        weight += randomBuff;
        if (randomBuff > 0.4) buffs.push('🍀 랜덤 행운');

        c.score = parseFloat(weight.toFixed(2));
        c.buffs = buffs;
        
        return { meal: c, weight };
      }).sort((a,b) => b.weight - a.weight);

      const fRanked = rankPool(frequentPool, true);
      const iRanked = rankPool(infrequentPool, false);

      let mixedPool = [...fRanked, ...iRanked].sort((a, b) => b.weight - a.weight);
      
      let chosenTop3 = mixedPool.slice(0, 3).map(x => x.meal);

      // Force exactly 4 items if possible: 1~3 regular, 4th is strictly '오늘의 도전' (Overpass API or fallback)
      if (overpassMeal) {
        chosenTop3.push(overpassMeal);
      } else {
        // Find an infrequent one that didn't make the top 3
        const unusedInfrequent = iRanked.map(x => x.meal).find(m => !chosenTop3.some(c => c.id === m.id));
        if (unusedInfrequent) {
          unusedInfrequent.restaurant.category = '오늘의 도전 (대체)';
          unusedInfrequent.buffs = ['📡 위성 API 과부하', '⚠️ 내부 DB에서 긴급 지원'];
          chosenTop3.push(unusedInfrequent);
        }
      }
      
      setRecommendedMeals(chosenTop3);
      setIsSpinning(false);
    }, 2000);
  };

  const handleMarkEaten = (meal: MealCandidate) => {
    addHistory(meal.restaurant.id, meal.menu?.name);
    refreshHistory();
    alert(`'${meal.menu?.name || meal.restaurant.name}' 방문 기록이 저장되었습니다.`);
    setRecommendedMeals([]);
  };

  return (
    <div className="app-container">
      <header className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', paddingBottom: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#ffffff', fontSize: '2.8rem', fontWeight: 900, margin: '0 0 0.3rem 0', letterSpacing: '-1px', textShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>오늘 뭐 먹지?</h1>
          <p style={{ margin: 0 }}>
            <span style={{ fontWeight: 700, color: '#e67e22', fontSize: '1.05rem', background: 'rgba(255, 255, 255, 0.9)', padding: '0.3rem 0.9rem', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={16} /> {officeLoc.name}
            </span>
            <button 
              onClick={() => setIsLocationModalOpen(true)}
              style={{ marginLeft: '8px', background: 'rgba(255, 255, 255, 0.25)', color: 'white', fontWeight: 600, fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderRadius: '20px', border: 'none', cursor: 'pointer', backdropFilter: 'blur(4px)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
            >오피스 변경</button>
          </p>
        </div>
      </header>

      <main className="main-content">
        {/* White glass container wrapping map + overlay cards */}
        <div className="main-glass-container">
          {/* Stacked layout: map behind, cards on top */}
          <div className="map-stack-wrapper">
            {/* Base layer: full-width map */}
            <div className="map-base-layer">
              <RestaurantMap 
                restaurants={dynamicRestaurants} 
                recommendedMeals={recommendedMeals}
                centerLat={officeLoc.lat} 
                centerLng={officeLoc.lng} 
              />
            </div>

            {/* Overlay: info cards grid - smaller version */}
            <div className="map-overlay-cards">
              {/* Weather card */}
              <div className="overlay-card">
                <WeatherWidget weather={weather} loading={weatherLoading} />
              </div>

              {/* 단골 식당 card */}
              <div className="overlay-card">
                <div className="overlay-card-inner" onClick={() => setIsFrequentManagerOpen(true)}>
                  <Star size={18} color="#ff8c00" fill="#ff8c00" />
                  <div className="overlay-card-label">단골 식당</div>
                  <div className="overlay-card-count" style={{ fontSize: '0.9rem' }}>{frequentIds.length}골</div>
                </div>
              </div>

              {/* 최근 점심 로그 card */}
              <div className="overlay-card">
                <div className="overlay-card-inner" onClick={() => setIsHistoryOpen(true)}>
                  <Clock size={18} color="#ff8c00" />
                  <div className="overlay-card-label">점심 로그</div>
                  <div className="overlay-card-count" style={{ fontSize: '0.9rem' }}>{history.length}건</div>
                </div>
              </div>
            </div>
          </div>

          {/* Spin button + results - inside the glass container */}
          <div style={{ padding: '0 0.5rem 0.5rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="spin-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={spin} disabled={isSpinning || weatherLoading}>
              {isSpinning ? '가챠 도는 중...' : <><Dices size={20} /> 점심 메뉴 추천받기</>}
            </button>

            {(recommendedMeals.length > 0 || isSpinning) && (
              <RecommendationList 
                meals={recommendedMeals} 
                onMarkEaten={handleMarkEaten}
                spinning={isSpinning}
              />
            )}
          </div>
        </div>
      </main>

      <LocationSettingsModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        savedOffices={savedOffices}
        activeOfficeId={activeOfficeId}
        onSelectOffice={(id) => {
          setActiveOfficeId(id);
          localStorage.setItem('lunch_active_office_id', id);
          setIsLocationModalOpen(false);
          setRecommendedMeals([]);
        }}
        onAddOffice={(loc) => {
          const updated = [...savedOffices, loc];
          setSavedOffices(updated);
          setActiveOfficeId(loc.id);
          localStorage.setItem('lunch_saved_offices', JSON.stringify(updated));
          localStorage.setItem('lunch_active_office_id', loc.id);
          setRecommendedMeals([]);
        }}
        onDeleteOffice={(id) => {
          const updated = savedOffices.filter(o => o.id !== id);
          setSavedOffices(updated);
          localStorage.setItem('lunch_saved_offices', JSON.stringify(updated));
          if (activeOfficeId === id && updated.length > 0) {
            setActiveOfficeId(updated[0].id);
            localStorage.setItem('lunch_active_office_id', updated[0].id);
            setRecommendedMeals([]);
          }
        }}
      />

      <HistoryPanel 
        history={history}
        restaurants={dynamicRestaurants}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onClear={() => {
            if (confirm('최근 식사 기록을 모두 삭제하시겠습니까?')) {
              clearHistory();
              refreshHistory();
            }
        }}
        onRemove={id => { removeHistoryItem(id); refreshHistory(); }}
      />

      <FrequentManager 
        restaurants={dynamicRestaurants.filter(r => getDistanceInMeters(officeLoc.lat, officeLoc.lng, r.lat, r.lng) <= 1500)}
        isOpen={isFrequentManagerOpen}
        onClose={() => setIsFrequentManagerOpen(false)}
        onToggle={handleToggleFrequent}
        onOpenAddModal={() => { setEditingRestaurant(undefined); setIsAddModalOpen(true); }}
        onEdit={openEditModal}
        onDeleteCustom={handleDeleteCustomRestaurant}
      />
      
      <AddRestaurantModal 
        isOpen={isAddModalOpen}
        initialData={editingRestaurant}
        officeLoc={officeLoc}
        onClose={() => { setIsAddModalOpen(false); setEditingRestaurant(undefined); }}
        onAdd={handleAddCustomRestaurant}
      />
    </div>
  );
}

export default App;
