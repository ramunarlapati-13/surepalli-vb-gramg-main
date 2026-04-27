// Minimal JS for additional interactions

document.addEventListener('DOMContentLoaded', () => {
    // Mobile-ready initialization or future app logic can go here
    console.log("Mobile App Initialized");
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}
