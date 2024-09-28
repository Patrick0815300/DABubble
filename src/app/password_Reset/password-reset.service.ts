import { Injectable } from '@angular/core';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { FirebaseLoginService } from '../firebase_LogIn/firebase-login.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {

constructor(private firebase: FirebaseLoginService){

}

  private auth = getAuth(initializeApp(this.firebase.firebaseConfig));


// Funktion zum Senden der Passwort-Reset-E-Mail
resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(this.auth, email)
    .then(() => {
      console.log('Passwort-Reset-E-Mail wurde gesendet');
    })
    .catch((error) => {
      console.error('Fehler beim Senden der Passwort-Reset-E-Mail:', error);
      throw error;
    });
  }
}
