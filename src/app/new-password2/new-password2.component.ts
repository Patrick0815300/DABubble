import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordResetService } from '../password_Reset/password-reset.service';
import { confirmPasswordReset, getAuth } from 'firebase/auth';
import { FirebaseLoginService } from '../firebase_LogIn/firebase-login.service';
import { Firestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

@Component({
  selector: 'app-new-password2',
  standalone: true,
  imports: [
    FooterComponent,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    RouterModule,
    NgClass,
    FormsModule
  ],
  templateUrl: './new-password2.component.html',
  styleUrl: './new-password2.component.scss'
})
export class NewPassword2Component {

  Password1: string = '';
  Password2: string = '';

  passwordAccordance: boolean = false;
  emptyInputs: boolean = true;
  displayError: boolean = false;
  passwordChanged: boolean = false;
  passwordNotLongEnough: boolean = false;

  constructor(private router: Router, private service: PasswordResetService, private firebase: FirebaseLoginService, private firestore: Firestore) {
    
  }

  private config = { // löschen
    projectId: 'dabubble-57387',
    appId: '1:1040544770849:web:1df07c76989e5816c56c60',
    storageBucket: 'dabubble-57387.appspot.com',
    apiKey: 'AIzaSyBSTXdqT4YVS0tJheGnc1evmzz6_kUya4k',
    authDomain: 'dabubble-57387.firebaseapp.com',
    messagingSenderId: '1040544770849',
  };

  private app = initializeApp(this.config); // löschen
  private auth = getAuth(this.app); // this.app löschen
  urlParams = new URLSearchParams(window.location.search);
  oobCode = this.urlParams.get('oobCode');



  /**
   * This function clears the inputs and changes the Passwords
   */
  changePassword() {
    if (this.checkForSamePasswords()) {
      //init.App
      this.resetPassword();
    } else {
      this.displayError = true;
      setTimeout(() => {
        this.displayError = false;
      }, 2000);
    }
  }

  /**
   * This function resets the password in the firebase authenticator
   */
  resetPassword() {
    if (this.oobCode) {
      confirmPasswordReset(this.auth, this.oobCode, this.Password1)
        .then(() => {
          console.log("Passwort erfolgreich zurückgesetzt.");
          this.service.redirectToLogin();
          this.passwordChanged = true;
          this.resetPasswordInDatabase();
          setTimeout(() => {
            this.passwordChanged = false;
          }, 2000);
        })
        .catch((error) => {
          console.error("Fehler beim Zurücksetzen des Passworts: ", error);
        });
    }
  }


  /**
   * This function resets the Password in the firebase-database
   */
  resetPasswordInDatabase() {
    if (this.auth.currentUser) {
      this.firebase.updatePassword(this.Password1, this.auth.currentUser.uid);
    }
  }

  /**
   * This function displays a message, that the Password was successfully changed 
   */
  displayPWChangedMessage() {
    this.passwordChanged = true;
    setTimeout(() => {
      this.passwordChanged = false;
      this.router.navigate(['/']);
    }, 2000);
  }

  /**
   * This function clears the inputs
   */
  clearInputs() {
    this.Password1 = '';
    this.Password2 = '';
  }

  /**
   * This function calls different Password-control functions
   */
  checkPasswords() {
    this.checkPasswordLength();
    this.checkForEmptyInputs();
    let changePossible = this.checkForSamePasswords();
    if (changePossible) {
      this.Password1
    } else {
    }
  }

  /**
   * This function checks, if the passwords are long enough
   */
  checkPasswordLength() {
    if (this.Password1.length < 6 || this.Password2.length < 6) {
      this.passwordNotLongEnough = true;
    } else {
      this.passwordNotLongEnough = false;
    }
  }

  /**
   * This function checks if the PW1 and PW2 are the same or not
   */
  checkForSamePasswords() {
    this.displayError = false;
    if (this.Password1 === this.Password2) {
      this.passwordAccordance = true;
      return true;
    } else {
      return false;
    }
  }

  /**
   * This function checks, if the Inputs for Password 1 and 2 are empty or not
   */
  checkForEmptyInputs() {
    if (!this.Password1 || !this.Password2) {
      this.emptyInputs = true;
    } else {
      this.emptyInputs = false;
    }
  }
}


