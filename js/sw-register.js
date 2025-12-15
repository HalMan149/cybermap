/**
 * 📝 Service Worker Registration
 * @description Registra el Service Worker si está soportado
 */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registrado:', registration.scope);
        
        // Verificar actualizaciones cada 5 minutos
        setInterval(() => {
          registration.update();
        }, 300000);
        
        // Manejar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Hay una nueva versión disponible
              console.log('🔄 Nueva versión disponible');
              
              // Opcional: notificar al usuario
              if (confirm('Hay una nueva versión disponible. ¿Recargar?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });
      })
      .catch(error => {
        console.warn('❌ Error registrando Service Worker:', error);
      });
  });
  
  // Recargar cuando el SW tome control
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}
