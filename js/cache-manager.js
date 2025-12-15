/**
 * 🚀 Cache Manager - Sistema de caché para optimizar carga de datos
 * @version 1.0.0
 * @description Maneja caché de datos API con expiración automática
 */

class CacheManager {
  constructor(defaultTTL = 300000) { // 5 minutos por defecto
    this.defaultTTL = defaultTTL;
    this.prefix = 'cybermap_cache_';
  }

  /**
   * Guardar datos en caché
   * @param {string} key - Clave única
   * @param {*} data - Datos a guardar
   * @param {number} ttl - Tiempo de vida en milisegundos
   */
  set(key, data, ttl = this.defaultTTL) {
    try {
      const item = {
        data: data,
        timestamp: Date.now(),
        ttl: ttl
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
      return true;
    } catch (e) {
      console.warn('Error guardando en caché:', e);
      // Si localStorage está lleno, limpiar cach és antiguas
      this.cleanup();
      return false;
    }
  }

  /**
   * Obtener datos de caché
   * @param {string} key - Clave única
   * @returns {*} Datos si están en caché y no han expirado, null si no
   */
  get(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();

      // Verificar si ha expirado
      if (now - parsed.timestamp > parsed.ttl) {
        this.delete(key);
        return null;
      }

      return parsed.data;
    } catch (e) {
      console.warn('Error leyendo caché:', e);
      return null;
    }
  }

  /**
   * Eliminar elemento del caché
   * @param {string} key - Clave única
   */
  delete(key) {
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * Limpiar todo el caché
   */
  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Limpiar cachés expiradas
   */
  cleanup() {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let cleaned = 0;

    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (now - item.timestamp > item.ttl) {
            localStorage.removeItem(key);
            cleaned++;
          }
        } catch (e) {
          // Si no se puede parsear, eliminar
          localStorage.removeItem(key);
          cleaned++;
        }
      }
    });

    console.log(`🧹 Cache cleanup: ${cleaned} elementos eliminados`);
    return cleaned;
  }

  /**
   * Obtener info del caché
   */
  getInfo() {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(k => k.startsWith(this.prefix));
    let totalSize = 0;

    cacheKeys.forEach(key => {
      const item = localStorage.getItem(key);
      totalSize += item.length * 2; // Aproximado en bytes (UTF-16)
    });

    return {
      count: cacheKeys.length,
      sizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      keys: cacheKeys.map(k => k.replace(this.prefix, ''))
    };
  }

  /**
   * Fetch con caché automático
   * @param {string} url - URL a fetch
   * @param {string} key - Clave de caché (opcional, usa URL por defecto)
   * @param {number} ttl - Tiempo de vida
   * @returns {Promise} Datos del fetch o caché
   */
  async fetchWithCache(url, key = null, ttl = this.defaultTTL) {
    const cacheKey = key || btoa(url).substring(0, 50); // Base64 de URL como key

    // Intentar obtener de caché
    const cached = this.get(cacheKey);
    if (cached) {
      console.log(`✓ Caché hit: ${cacheKey}`);
      return cached;
    }

    // Si no está en caché, hacer fetch
    console.log(`↓ Fetching: ${url}`);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this.set(cacheKey, data, ttl);
      return data;
    } catch (error) {
      console.error('Error en fetchWithCache:', error);
      throw error;
    }
  }
}

// Crear instancia global
window.cacheManager = new CacheManager();

// Limpiar caché antigua al cargar
window.cacheManager.cleanup();
