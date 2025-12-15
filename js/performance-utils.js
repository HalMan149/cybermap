/**
 * 🎯 Performance Utils - Utilidades para optimizar rendimiento
 * @version 1.0.0
 */

/**
 * Throttle - Limita la frecuencia de ejecución de una función
 * @param {Function} func - Función a throttle
 * @param {number} delay - Delay en ms
 * @returns {Function} Función throttled
 */
function throttle(func, delay) {
  let inProgress = false;
  return function(...args) {
    if (inProgress) return;
    inProgress = true;
    func.apply(this, args);
    setTimeout(() => inProgress = false, delay);
  };
}

/**
 * Debounce - Retrasa la ejecución hasta que dejen de llamarla
 * @param {Function} func - Función a debounce
 * @param {number} delay - Delay en ms
 * @returns {Function} Función debounced
 */
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * RequestAnimationFrame wrapper para animaciones smooth
 * @param {Function} callback - Función a ejecutar en cada frame
 * @returns {Object} Objeto con start/stop
 */
function smoothAnimation(callback) {
  let rafId = null;
  let isRunning = false;

  return {
    start() {
      if (isRunning) return;
      isRunning = true;

      const animate = () => {
        if (!isRunning) return;
        callback();
        rafId = requestAnimationFrame(animate);
      };

      rafId = requestAnimationFrame(animate);
    },
    stop() {
      isRunning = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
    isRunning() {
      return isRunning;
    }
  };
}

/**
 * Cleanup Manager - Gestiona limpieza de timers e intervals
 */
class CleanupManager {
  constructor() {
    this.timers = new Set();
    this.intervals = new Set();
    this.listeners = new Map();
  }

  setTimeout(callback, delay, ...args) {
    const id = setTimeout(() => {
      this.timers.delete(id);
      callback(...args);
    }, delay);
    this.timers.add(id);
    return id;
  }

  setInterval(callback, delay, ...args) {
    const id = setInterval(callback, delay, ...args);
    this.intervals.add(id);
    return id;
  }

  clearTimeout(id) {
    clearTimeout(id);
    this.timers.delete(id);
  }

  clearInterval(id) {
    clearInterval(id);
    this.intervals.delete(id);
  }

  addEventListener(element, event, handler, options) {
    if (!this.listeners.has(element)) {
      this.listeners.set(element, []);
    }
    this.listeners.get(element).push({ event, handler, options });
    element.addEventListener(event, handler, options);
  }

  cleanupAll() {
    // Limpiar timers
    this.timers.forEach(id => clearTimeout(id));
    this.timers.clear();

    // Limpiar intervals
    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();

    // Limpiar event listeners
    this.listeners.forEach((handlers, element) => {
      handlers.forEach(({ event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
    });
    this.listeners.clear();

    console.log('🧹 Cleanup completo realizado');
  }
}

/**
 * Lazy Loader - Carga recursos bajo demanda
 */
class LazyLoader {
  constructor() {
    this.loaded = new Set();
    this.loading = new Map();
  }

  async loadScript(url, id = null) {
    const scriptId = id || url;

    if (this.loaded.has(scriptId)) {
      return Promise.resolve();
    }

    if (this.loading.has(scriptId)) {
      return this.loading.get(scriptId);
    }

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => {
        this.loaded.add(scriptId);
        this.loading.delete(scriptId);
        resolve();
      };
      script.onerror = () => {
        this.loading.delete(scriptId);
        reject(new Error(`Failed to load script: ${url}`));
      };
      document.head.appendChild(script);
    });

    this.loading.set(scriptId, promise);
    return promise;
  }

  async loadCSS(url, id = null) {
    const cssId = id || url;

    if (this.loaded.has(cssId)) {
      return Promise.resolve();
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
    this.loaded.add(cssId);

    return Promise.resolve();
  }
}

/**
 * Performance Monitor - Monitorea métricas de rendimiento
 */
class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = [];
  }

  mark(name) {
    this.marks.set(name, performance.now());
  }

  measure(name, startMark, endMark = null) {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();

    if (!start) {
      console.warn(`Mark "${startMark}" not found`);
      return null;
    }

    const duration = end - start;
    this.measures.push({ name, duration, timestamp: Date.now() });

    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  getReport() {
    return {
      measures: this.measures,
      averages: this.getAverages()
    };
  }

  getAverages() {
    const grouped = {};
    this.measures.forEach(m => {
      if (!grouped[m.name]) grouped[m.name] = [];
      grouped[m.name].push(m.duration);
    });

    const averages = {};
    Object.keys(grouped).forEach(key => {
      const values = grouped[key];
      averages[key] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
    });

    return averages;
  }
}

// Crear instancias globales
window.cleanupManager = new CleanupManager();
window.lazyLoader = new LazyLoader();
window.perfMonitor = new PerformanceMonitor();

// Exportar funciones útiles
window.throttle = throttle;
window.debounce = debounce;
window.smoothAnimation = smoothAnimation;

// Cleanup al cerrar/recargar página
window.addEventListener('beforeunload', () => {
  window.cleanupManager.cleanupAll();
});

console.log('✅ Performance utils cargadas');
