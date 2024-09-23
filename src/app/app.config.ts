import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp({ "projectId": "dabubble-77a15", "appId": "1:253194164742:web:3b8ee039baaa40e9d2c187", "databaseURL": "https://dabubble-77a15-default-rtdb.europe-west1.firebasedatabase.app", "storageBucket": "dabubble-77a15.appspot.com", "apiKey": "AIzaSyDpRdyiicHq6IZvm9jKFwpnGceSvZnqbr4", "authDomain": "dabubble-77a15.firebaseapp.com", "messagingSenderId": "253194164742" })),
    provideFirestore(() => getFirestore()), provideFirebaseApp(() => initializeApp({ "projectId": "dabubble-77a15", "appId": "1:253194164742:web:3b8ee039baaa40e9d2c187", "databaseURL": "https://dabubble-77a15-default-rtdb.europe-west1.firebasedatabase.app", "storageBucket": "dabubble-77a15.appspot.com", "apiKey": "AIzaSyDpRdyiicHq6IZvm9jKFwpnGceSvZnqbr4", "authDomain": "dabubble-77a15.firebaseapp.com", "messagingSenderId": "253194164742" })), provideFirestore(() => getFirestore()),]
};


