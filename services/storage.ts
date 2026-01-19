export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      
      try {
        // Intentar parsear como JSON
        return JSON.parse(item) as T;
      } catch (parseError) {
        // Si falla (como el error 'Richard'), devolvemos el valor crudo si se espera un string
        if (typeof defaultValue === 'string') {
          return item as unknown as T;
        }
        return defaultValue;
      }
    } catch (e) {
      console.error(`Error reading from localStorage: ${key}`, e);
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing to localStorage: ${key}`, e);
    }
  }
};