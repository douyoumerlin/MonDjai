export const LocalDatabase = {
  saveData: <T>(key: string, data: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving data to localStorage for key ${key}:`, error);
    }
  },

  loadData: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error loading data from localStorage for key ${key}:`, error);
      return defaultValue;
    }
  },

  removeData: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data from localStorage for key ${key}:`, error);
    }
  },

  clearAll: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};
