import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { setLogLevel } from 'firebase/firestore';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
//setLogLevel('debug'); // Firestore-Debugging aktivieren