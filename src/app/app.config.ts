import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

registerLocaleData(localeDe);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp({
      "projectId": "dabubble-57387",
      "appId": "1:1040544770849:web:1df07c76989e5816c56c60",
      "databaseURL": "https://dabubble-57387-default-rtdb.europe-west1.firebasedatabase.app",
      "storageBucket": "dabubble-57387.appspot.com",
      "apiKey": "AIzaSyBSTXdqT4YVS0tJheGnc1evmzz6_kUya4k",
      "authDomain": "dabubble-57387.firebaseapp.com",
      "messagingSenderId": "1040544770849"
    })),
    provideFirestore(() => getFirestore()), provideFirebaseApp(() => initializeApp({
      "projectId": "dabubble-57387",
      "appId": "1:1040544770849:web:1df07c76989e5816c56c60",
      "databaseURL": "https://dabubble-57387-default-rtdb.europe-west1.firebasedatabase.app",
      "storageBucket": "dabubble-57387.appspot.com",
      "apiKey": "AIzaSyBSTXdqT4YVS0tJheGnc1evmzz6_kUya4k",
      "authDomain": "dabubble-57387.firebaseapp.com",
      "messagingSenderId": "1040544770849"
    })), provideFirestore(() => getFirestore()),]
};


