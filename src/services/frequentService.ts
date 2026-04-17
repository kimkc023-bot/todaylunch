import { BASE_FREQUENT_IDS } from '../data/restaurants';

const FREQUENT_KEY = 'lunch_frequent_ids';

export const getFrequentIds = (): string[] => {
  try {
    const data = localStorage.getItem(FREQUENT_KEY);
    if (!data) return BASE_FREQUENT_IDS;
    
    const stored = JSON.parse(data);
    return stored;
  } catch (e) {
    return BASE_FREQUENT_IDS;
  }
};

export const setFrequentIds = (ids: string[]): void => {
  localStorage.setItem(FREQUENT_KEY, JSON.stringify(ids));
};

export const toggleFrequent = (id: string): string[] => {
  const current = getFrequentIds();
  let updated;
  if (current.includes(id)) {
    updated = current.filter(fid => fid !== id);
  } else {
    updated = [...current, id];
  }
  setFrequentIds(updated);
  return updated;
};
