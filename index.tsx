import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // WICHTIG: './sw.js' statt '/sw.js', damit es auch auf GitHub Pages (/RepoName/) funktioniert
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('PortoIQ Service Worker registered: ', registration.scope);
      })
      .catch((err) => {
        console.log('PortoIQ Service Worker registration failed: ', err);
      });
  });
}