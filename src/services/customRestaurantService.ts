import type { Restaurant } from '../types';

const CUSTOM_RESTAURANTS_KEY = 'lunch_custom_restaurants';

export const getCustomRestaurants = (): Restaurant[] => {
  try {
    const data = localStorage.getItem(CUSTOM_RESTAURANTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const setCustomRestaurants = (restaurants: Restaurant[]): void => {
  localStorage.setItem(CUSTOM_RESTAURANTS_KEY, JSON.stringify(restaurants));
};

export const addCustomRestaurant = (restaurant: Restaurant): Restaurant[] => {
  const current = getCustomRestaurants();
  const updated = [...current, restaurant];
  setCustomRestaurants(updated);
  return updated;
};

export const updateCustomRestaurant = (restaurant: Restaurant): Restaurant[] => {
  const current = getCustomRestaurants();
  const updated = current.map(r => r.id === restaurant.id ? restaurant : r);
  setCustomRestaurants(updated);
  return updated;
};

export const removeCustomRestaurant = (id: string): Restaurant[] => {
  const current = getCustomRestaurants();
  const updated = current.filter(r => r.id !== id);
  localStorage.setItem(CUSTOM_RESTAURANTS_KEY, JSON.stringify(updated));
  return updated;
};
