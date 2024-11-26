import { ApplicationConfig, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { routes } from './app.routes';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';
import { getStorage, provideStorage } from '@angular/fire/storage';

registerLocaleData(localeDe);

const config = {
  // projectId: 'dabubble-57387',
  // appId: '1:1040544770849:web:1df07c76989e5816c56c60',
  // storageBucket: 'dabubble-57387.appspot.com',
  // apiKey: 'AIzaSyBSTXdqT4YVS0tJheGnc1evmzz6_kUya4k',
  // authDomain: 'dabubble-57387.firebaseapp.com',
  // messagingSenderId: '1040544770849',
  apiKey: "AIzaSyDCP-h_xtZt_6MAKl_ixtnt7pDgDzjp-FI",
  authDomain: "dabubble-899ad.firebaseapp.com",
  projectId: "dabubble-899ad",
  storageBucket: "dabubble-899ad.firebasestorage.app",
  messagingSenderId: "18801943150",
  appId: "1:18801943150:web:34b2495ab4d9823fd2fc7f"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(config)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideAnimationsAsync(),
    provideHttpClient(),
  ],
};
