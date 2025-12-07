/* PWA Install Prompt */
var deferredPrompt;

window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredPrompt = e;
  if (!localStorage.getItem('installDismissed')) {
    document.getElementById('installBanner').classList.remove('hide');
  }
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(choiceResult) {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      deferredPrompt = null;
      document.getElementById('installBanner').classList.add('hide');
    });
  }
}

function dismissInstall() {
  document.getElementById('installBanner').classList.add('hide');
  localStorage.setItem('installDismissed', 'true');
}

/* Service Worker Registration */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      console.log('ServiceWorker registered: ', registration.scope);
    }).catch(function(error) {
      console.log('ServiceWorker registration failed: ', error);
    });
  });
}
