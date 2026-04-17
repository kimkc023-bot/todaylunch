export type WeatherCondition = 'hot' | 'cold' | 'rain' | 'clear' | 'cloudy' | 'any';

export interface MenuItem {
  name: string;
  price?: number;
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  walkingTime?: number;
  isBlueRibbon: boolean;
  isFrequent?: boolean;
  isCustom?: boolean;
  lat: number;
  lng: number;
  weatherTags: WeatherCondition[];
  menus: MenuItem[];
  imageUrl?: string;
}

export interface MealCandidate {
  id: string; // unique ID for the meal instance
  restaurant: Restaurant;
  menu?: MenuItem;
  isFrequent: boolean;
  calculatedDistance?: number;
  score?: number;
  buffs?: string[];
  story?: string;
}

export interface WeatherData {
  temperature: number;
  isRaining: boolean;
  condition: WeatherCondition;
}

export interface HistoryItem {
  id: string;
  restaurantId: string;
  menuName?: string;
  date: string;
}
