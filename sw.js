/**
 * 🚀 Service Worker - Caché inteligente para Cybermap
 * @version 1.0.0
 */

const CACHE_NAME = 'cybermap-v1.0.0';
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 horas

// Recursos estáticos a cachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/mapa_tierra_v2.html',
  '/mapa_cyber.html',
  '/js/cache-manager.js',
  '/js/performance-utils.js'
];

// URLs externas que queremos cachear
const EXTERNAL_RESOURCES = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/suncalc@1.9.0/suncalc.js'
];

// Install - Cachear recursos iniciales
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Cacheando recursos estáticos...');
      return cache.addAll(STATIC_ASSETS.concat(EXTERNAL_RESOURCES))
        .catch(err => {
          console.warn('Algunos recursos no se pudieron cachear:', err);
          // No fallar si algunos recursos no se pueden cachear
          return Promise.resolve();
        });
    }).then(() => {
      console.log('✅ Service Worker instalado');
      return self.skipWaiting();
    })
  );
});

// Activate - Limpiar cachés antiguas
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activado');
      return self.clients.claim();
    })
  );
});

// Fetch - Estrategia de caché
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear GET requests
  if (request.method !== 'GET') return;

  // Estrategia diferente según el tipo de recurso
  if (isAPIRequest(url)) {
    // APIs: Network First, luego Cache
    event.respondWith(networkFirst(request));
  } else if (isStaticAsset(url)) {
    // Assets estáticos: Cache First, luego Network
    event.respondWith(cacheFirst(request));
  } else {
    // Otros: Network First
    event.respondWith(networkFirst(request));
  }
});

/**
 * Cache First Strategy
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    console.log('✓ Cache hit:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Network error:', error);
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Network First Strategy
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    // Cachear respuestas exitosas
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Si falla la red, intentar caché
    const cached = await caches.match(request);
    if (cached) {
      console.log('⚠️ Usando caché (network failed):', request.url);
      return cached;
    }
    
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Verificar si es request a API
 */
function isAPIRequest(url) {
  return url.hostname.includes('earthquake.usgs.gov') ||
         url.hostname.includes('api.') ||
         url.pathname.includes('/api/') ||
         url.pathname.includes('.json');
}

/**
 * Verificar si es asset estático
 */
function isStaticAsset(url) {
  return url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|woff|woff2)$/);
}

// Mensajes desde la página
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'clearCache') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log('🗑️ Caché limpiada');
      })
    );
  }
});

console.log('🚀 Service Worker loaded');
