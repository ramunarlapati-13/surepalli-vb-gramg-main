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

// PWA Install Logic
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  if (installBtn) installBtn.style.display = 'flex';

  installBtn.addEventListener('click', () => {
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
      installBtn.style.display = 'none';
    });
  });
});

window.addEventListener('appinstalled', (evt) => {
  console.log('App was installed');
  if (installBtn) installBtn.style.display = 'none';
});

// Auth Logic for Musters Database
const mustersBtn = document.getElementById('musters-btn');
const authModal = document.getElementById('auth-modal');
const closeAuthModal = document.getElementById('close-auth-modal');
const pinInput = document.getElementById('pin-input');
const verifyPinBtn = document.getElementById('verify-pin-btn');
const googleLoginBtn = document.getElementById('google-login-btn');

const MUSTERS_LINK = "https://drive.google.com/drive/folders/15o6EspLO4MdsZfGHxMTFxO1Zlgkavf7f?usp=sharing";
const CORRECT_PIN = "1157";

// Check if already authorized
function isAuthorized() {
    return localStorage.getItem('musters_authorized') === 'true';
}

mustersBtn.addEventListener('click', () => {
    if (isAuthorized()) {
        window.open(MUSTERS_LINK, '_blank');
    } else {
        authModal.classList.add('active');
        pinInput.focus();
    }
});

closeAuthModal.addEventListener('click', () => {
    authModal.classList.remove('active');
    pinInput.value = '';
});

verifyPinBtn.addEventListener('click', () => {
    if (pinInput.value === CORRECT_PIN) {
        localStorage.setItem('musters_authorized', 'true');
        authModal.classList.remove('active');
        window.open(MUSTERS_LINK, '_blank');
    } else {
        alert('Incorrect PIN. Please try again.');
        pinInput.value = '';
        pinInput.focus();
    }
});

pinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        verifyPinBtn.click();
    }
});

googleLoginBtn.addEventListener('click', () => {
    alert('Google Login will be available soon. Please use the PIN for now.');
    // Note: To implement real Google Login, we would initialize Firebase Auth here
    // and check if the user email is bandilasuresh440@gmail.com or ramunarlapati27@gmail.com
});

