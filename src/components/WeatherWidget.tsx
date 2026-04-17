import React from 'react';
import type { WeatherData } from '../types';
import { Sun, Cloud, CloudRain, Thermometer, Wind } from 'lucide-react';

interface Props {
  weather: WeatherData | null;
  loading: boolean;
}

const WeatherWidget: React.FC<Props> = ({ weather, loading }) => {
  if (loading) {
    return (
      <div className="overlay-card-inner" style={{ cursor: 'default' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f0f0f0', animation: 'pulse 1.2s infinite' }} />
        <div className="overlay-card-label" style={{ color: '#aaa' }}>날씨 로딩...</div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="overlay-card-inner" style={{ cursor: 'default' }}>
        <Thermometer size={28} color="#ff8c00" />
        <div className="overlay-card-label">날씨 미확인</div>
      </div>
    );
  }

  const getIcon = (cond: string) => {
    switch (cond) {
      case 'rain': return <CloudRain size={28} color="#5b9bd5" />;
      case 'hot': return <Sun size={28} color="#f39c12" />;
      case 'cold': return <Wind size={28} color="#74b9ff" />;
      case 'clear': return <Sun size={28} color="#f39c12" />;
      case 'cloudy': return <Cloud size={28} color="#636e72" />;
      default: return <Sun size={28} color="#ff8c00" />;
    }
  };


  return (
    <div className="overlay-card-inner" style={{ cursor: 'default', gap: '0.1rem' }}>
      {getIcon(weather.condition)}
      <div className="overlay-card-count">{Math.round(weather.temperature)}°C</div>
      <div className="overlay-card-label">날씨</div>
    </div>
  );
};

export default WeatherWidget;
