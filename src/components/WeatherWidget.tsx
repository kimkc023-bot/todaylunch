import React from 'react';
import type { WeatherData } from '../types';

interface Props {
  weather: WeatherData | null;
  loading: boolean;
}

const WeatherWidget: React.FC<Props> = ({ weather, loading }) => {
  if (loading) {
    return (
      <div className="weather-widget glass-panel">
        <div className="skeleton-text">날씨 정보 불러오는 중...</div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  const getEmoji = (cond: string) => {
    switch (cond) {
      case 'rain': return '🌧️';
      case 'hot': return '🥵';
      case 'cold': return '🥶';
      case 'clear': return '☀️';
      case 'cloudy': return '☁️';
      default: return '🌤️';
    }
  };

  const getMessage = (cond: string) => {
    switch (cond) {
      case 'rain': return '비오는 날엔 국물이 생각나네요!';
      case 'hot': return '더운 날엔 시원한 메뉴가 좋겠죠?';
      case 'cold': return '추운 날씨엔 따뜻한 음식이 최고!';
      case 'clear': return '날씨가 좋네요! 맛있는 점심 드세요.';
      case 'cloudy': return '구름이 잔뜩 낀 날, 오늘 점심은 뭘까요?';
      default: return '오늘 점심 뭐 먹을까요?';
    }
  };

  return (
    <div className="weather-widget glass-panel">
      <div className="weather-temp">
        <span className="emoji">{getEmoji(weather.condition)}</span>
        <span className="temp">{Math.round(weather.temperature)}°C</span>
      </div>
      <div className="weather-msg">
        {getMessage(weather.condition)}
      </div>
    </div>
  );
};

export default WeatherWidget;
