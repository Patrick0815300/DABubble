import { Injectable } from '@angular/core';
import { getAuth, sendPasswordResetEmail, updatePassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { FirebaseLoginService } from '../firebase_LogIn/firebase-login.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {

  constructor(private firebase: FirebaseLoginService, private router: Router) {

  }

  private auth = getAuth(initializeApp(this.firebase.firebaseConfig));


  /**
   * This function sends a resetPassword mail from the firebase-database to the user
   * @param email - the users E-mail adress
   * @returns ture or false depends on creating an error or not
   */
  resetPassword(email: string) {
      sendPasswordResetEmail(this.auth, email)
      .then(() => {
        console.log("Passwort-Zurücksetzen-E-Mail wurde gesendet.");
      })
      .catch((error) => {
        console.error("Fehler beim Senden der Passwort-Zurücksetzen-E-Mail: ", error);
      });
  }

  // updateAuthPassword(newPassword:string){
  //   const auth = getAuth();
  //   const user = auth.currentUser; // Aktuell angemeldeter Benutzer
    
  //   if (user) {
  //       updatePassword(user, newPassword).then(() => {
  //           console.log("Passwort erfolgreich geändert.");
  //           // this.firebase.updatePassword(newPassword, user.uid);
  //       }).catch((error:any) => {
  //           console.error("Fehler beim Ändern des Passworts:", error);
  //       });
  //   } else {
  //       console.log("Kein Benutzer ist angemeldet.");
  //   }
  // }

    /**
   * This function sends the user back to the login-page after a timeout of 2 Sec. 
   */
    redirectToLogin() {
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
    }
}
