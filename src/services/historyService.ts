import type { HistoryItem } from '../types';

const HISTORY_KEY = 'lunch_history';

export const getHistory = (): HistoryItem[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const addHistory = (restaurantId: string, menuName?: string): void => {
  const current = getHistory();
  const newItem: HistoryItem = {
    id: `${restaurantId}_${menuName || 'null'}_${Date.now()}`,
    restaurantId,
    menuName,
    date: new Date().toISOString(),
  };
  
  const updated = [newItem, ...current].slice(0, 50); // Keep last 50 items to prevent bloat
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
};

export const removeHistoryItem = (id: string): void => {
  const current = getHistory();
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
};

export const clearHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};

// Check if eaten in last N days
export const isRecentlyEaten = (restaurantId: string, menuName: string | undefined, history: HistoryItem[], days: number = 3): boolean => {
  const cutoffTime = new Date().getTime() - (days * 24 * 60 * 60 * 1000);
  
  return history.some(item => {
    const itemTime = new Date(item.date).getTime();
    if (itemTime < cutoffTime) return false;
    
    // If it's a specific menu check, we block if they ate EXACTLY that menu.
    // If menuName is undefined (e.g. buffet), block the whole restaurant.
    if (!menuName && item.restaurantId === restaurantId) return true;
    if (menuName && item.restaurantId === restaurantId && item.menuName === menuName) return true;
    
    return false;
  });
};
