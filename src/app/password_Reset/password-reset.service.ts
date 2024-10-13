import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {

  constructor(private router: Router) { }

  private auth = getAuth();

  /**
   * This function sends a resetPassword mail from the firebase-database to the user
   * @param email - the users E-mail adress
   * @returns ture or false depends on creating an error or not
   */
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

  /**
  This function sends the user back to the login-page after a timeout of 2 Sec.
  */
  redirectToLogin() {
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 2000);
  }
}
