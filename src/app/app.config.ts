import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';

const config = {
  projectId: 'dabubble-57387',
  appId: '1:1040544770849:web:1df07c76989e5816c56c60',
  storageBucket: 'dabubble-57387.appspot.com',
  apiKey: 'AIzaSyBSTXdqT4YVS0tJheGnc1evmzz6_kUya4k',
  authDomain: 'dabubble-57387.firebaseapp.com',
  messagingSenderId: '1040544770849',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp(config)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
  ],
};
