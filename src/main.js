import { Router } from '@vaadin/router';
import './router/app-router.js';
import './components/app-header/AppHeader.js';
import LanguageDetector from 'i18next-browser-languagedetector'; 
import i18next from 'i18next';
import HttpApi from 'i18next-http-backend'; 

i18next
  .use(HttpApi) 
  .use(LanguageDetector) 
  .init({
    fallbackLng: 'en', 
    debug: false,
    detection: {
      
      order: ['localStorage', 'navigator'],
    
      caches: ['localStorage'],
    },
    backend: {
      loadPath: '/locales/{{lng}}.json',
    },
    interpolation: {
       escapeValue: false
    }
  }, (err, t) => {
    if (err) {
      
        return;
    }
 
  })
  .then(() => {
    setupRouterAndInform();
  })
  .catch((err) => {
      console.error('[main.js] i18next initialization promise rejected:', err);
  });

function setupRouterAndInform() {
    console.log('[main.js] Setting up router...');
    const outlet = document.querySelector('app-root');
    // Ensure outlet exists before creating Router
    if (outlet) {
        const router = new Router(outlet);
        router.setRoutes(window.appRoutes);
        console.log('[main.js] Router setup complete.');
    } else {
        console.error('[main.js] <app-root> element not found for router outlet.');
    }

    document.dispatchEvent(new CustomEvent('i18n-ready'));
} 