if ('serviceWorker' in navigator && ['localhost', '127.0.0.1'].includes(location.hostname)) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
} else if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service workers are optional; the app remains usable without one.
    });
  });
}
