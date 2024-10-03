import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'bubble-86d4d',
        appId: '1:3761237724:web:64cd4f48f9da444d930e19',
        storageBucket: 'bubble-86d4d.appspot.com',
        apiKey: 'AIzaSyA92YnttoSKvwWAHB97wrv-qJS4FiWlh74',
        authDomain: 'bubble-86d4d.firebaseapp.com',
        messagingSenderId: '3761237724',
      })
    ),
    provideFirestore(() => getFirestore()),
  ],
};
