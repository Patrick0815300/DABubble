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
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';




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

  private auth = getAuth(); // Firebase Auth initialisieren

  mail: string = '';
  password: string = '';
  displayWrongMailOrPasswordError: boolean = false;

  constructor(private firebase: FirebaseLoginService, private router: Router) {

  }

  db = getFirestore();

  // Google-Anmeldungsanbieter initialisieren (Neu hinzugefügt)
  private googleProvider = new GoogleAuthProvider();

  // /**
  //  * This function retriebes the userdata from the firebase database
  //  * @param q Firebase Query
  //  * @returns the Data
  //  */
  // async getUserData(user: any) {
  //   const db = this.db; // Stelle sicher, dass db korrekt initialisiert ist    
  //   if (!db) {
  //     throw new Error("Firestore-Instanz (db) ist nicht initialisiert.");
  //   }
  // // Benutzerreferenz in Firestore basierend auf der UID
  // const userRef = doc(db, "users", user.uid);
  // const userDoc = await getDoc(userRef);

  // if (userDoc.exists()) {
  //   return userDoc.data();
  // } else {
  //   console.log("Keine Benutzerdaten vorhanden.");
  //   return null;
  // }
  // }

  async login() {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.mail, this.password);
      console.log(userCredential);
      
      this.sendUserToDesktop(userCredential);
      await this.setVarOnlineToTrue(userCredential);
    } catch (error) {
      this.displayWrongMailOrPasswordErrorMessage();
      this.resetInputs();
    }
  }

  /**
   * This function sets the Var "online" in firebase to true
   * @param userCredential User - object
   */
  async setVarOnlineToTrue(userCredential:any){
    await updateDoc(this.firebase.getSingleUserRef('users', userCredential.user.uid), {
      online: true
    });
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

  /**
   * This function sends the user to the desktop-Page
   * @param userCredential User - object
   */
  sendUserToDesktop(userCredential: any) {
    const user = userCredential.user;
    this.router.navigate(['/desktop', user.uid]);
  }

/**
 * This function saves a user in the firebase authenticator after loggin in via google
 */
  async googleLogin() { 
    try {
      const userCredential = await signInWithPopup(this.auth, this.googleProvider);
      await this.saveUserData(userCredential.user);
      this.sendUserToDesktop(userCredential);
    } catch (error) {
      console.error("Fehler bei der Google-Anmeldung:", error);
      this.displayWrongMailOrPasswordErrorMessage();
    }
  }

 /**
  * This function saves the user-data in the firebase database, after logging in via google
  * @param user user - data
  */
  async saveUserData(user: any) {
    const userRef = doc(this.db, "users", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      online: true,
    }, { merge: true }); // merge: true aktualisiert die Daten, falls sie bereits existieren
  }
}