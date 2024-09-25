import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';
import { FirebaseLoginService } from '../firebase_LogIn/firebase-login.service';
import { NgIf } from '@angular/common';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    RouterModule,
    FooterComponent,
    HeaderComponent,
    FormsModule,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  mail: string = '';
  password: string = '';
  displayWrongMailOrPasswordError: boolean = false;

  constructor(private firebase: FirebaseLoginService, private router: Router) {

  }

  /**
   * This function triggers function to call the id and password from the firebase database and checks, if the written password and the password in the database is the same.
   * If so, it will send the User to the dashboard, if not, it will display an error message under the password input
   */
  async onSubmit() { // Link anpassen zu dashboard statt chooseAvatar
    if (await this.firebase.findUserWithEmail(this.mail)) {
      let q = await this.firebase.gettingQuery(this.mail);
      const safedPassword = await this.getPasswordFromFirebase(q);
      if (safedPassword === this.password) {
        let id = this.getIdFromFirebase(q);
        this.router.navigate(['/chooseAvatar', id]); // Link anpassen
      }
      else {
        this.displayWrongMailOrPasswordErrorMessage();
      }
    } else {
      this.displayWrongMailOrPasswordErrorMessage();
    }
  }

  /**
   * This function retriebes the userdata from the firebase database
   * @param q Firebase Query
   * @returns the Data
   */
  getUserData(q: any) {
    try {
      if (!q.empty) {
        const userDoc = q.docs[0];
        const userData = userDoc.data();
        return userData;
      }
      return !q.empty
    } catch (err: any) {
      console.error("Error checking email existence: ", err);
      return false;
    }
  }

  /**
   * This function retriebes the id from the firebase database
   * @param q Firebase Query
   * @returns the id
   */
  getIdFromFirebase(q: any) {
    try {
      if (!q.empty) {
        const userData = this.getUserData(q);
        const id = userData['id'];
        return id;
      }
      return !q.empty;
    } catch (err: any) {
      console.error("Error checking email existence: ", err);
      return false;
    }
  }

  /**
   * This function retriebes the password from the firebase database
   * @param q Firebase Query
   * @returns the password
   */
  getPasswordFromFirebase(q: any) {
    try {
      if (!q.empty) {
        const userData = this.getUserData(q);
        const password = userData['password']; // Hier wird das Passwort abgerufen           
        return password; // Gebe das Passwort zurück oder nutze es entsprechend
      }
      return !q.empty;
    } catch (err: any) {
      console.error("Error checking email existence: ", err);
      return false;
    }
  }

  /**
   * This function resets all input-tags on the login-screen
   */
  resetInputs() {
    this.mail = '';
    this.password = '';
  }

  /**
   * This function changes the value for displayWrongMailOrPasswordError-Variable from false to true for 2 seconds, sothat an Error will be displayed for this time
   */
  displayWrongMailOrPasswordErrorMessage() {
    this.displayWrongMailOrPasswordError = true;
    setTimeout(() => {
      this.displayWrongMailOrPasswordError = false;
    }, 2000);
  }

}
