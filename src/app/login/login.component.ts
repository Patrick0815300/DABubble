import { CurrentUserService } from './../modules/current-user.service';
import { Component, OnInit } from '@angular/core';
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
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { UserService } from '../service/user.service/user.service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { DatabaseServiceService } from '../database-service.service';
import { Channel, ChannelMember, User } from '../modules/database.model';
import { nanoid } from 'nanoid';
import { GuestService } from '../modules/guest.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatToolbarModule, MatCardModule, MatIconModule, MatFormFieldModule, RouterModule, FooterComponent, HeaderComponent, FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  mail: string = '';
  password: string = '';
  displayWrongMailOrPasswordError: boolean = false;
  onlineUser: any = null;
  officeTeamChannel!: Channel;
  constructor(
    private firebase: FirebaseLoginService,
    private guestService: GuestService,
    private databaseService: DatabaseServiceService,
    private router: Router,
    private userService: UserService,
    private firestore: Firestore,
    private auth: Auth,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit(): void {
    this.currentUserService.onlineUser$.subscribe(user => {
      this.onlineUser = user;
    });

    this.databaseService.officeTeam().subscribe(team => {
      this.officeTeamChannel = team;
    });
  }

  private googleProvider = new GoogleAuthProvider();

  /**
   * THis function checks, if there is a account of the user. If yes the user will be logged in and will be send to the desktop-page
   */
  async login() {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.mail, this.password);
      await this.createNewUserObject(userCredential);
      this.sendUserToDesktop(userCredential);
      await this.setVarOnlineToTrue(userCredential);
    } catch (error) {
      this.displayWrongMailOrPasswordErrorMessage();
      this.resetInputs();
    }
  }

  /**
   * This function sets a user in the userService for other components to get the data
   * @param userCredential user data
   */
  async createNewUserObject(userCredential: any) {
    let userRef = this.firebase.getSingleUserRef('users', userCredential.user.uid);
    const userSnapshot = await getDoc(userRef);
    let user = userSnapshot.data();
    this.userService.setUser(user);
  }

  /**
   * This function sets the Var "online" in firebase to true
   * @param userCredential User - object
   */
  async setVarOnlineToTrue(userCredential: any) {
    await updateDoc(this.firebase.getSingleUserRef('users', userCredential.user.uid), {
      online: true,
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
      console.error('Fehler bei der Google-Anmeldung:', error);
      this.displayWrongMailOrPasswordErrorMessage();
    }
  }

  /**
   * This function saves the user-data in the firebase database, after logging in via google
   * @param user user - data
   */
  async saveUserData(user: any) {
    const userRef = doc(this.firestore, 'users', user.uid);
    await setDoc(
      userRef,
      {
        name: user.displayName,
        email: user.email,
        avatar: user.photoURL,
        online: false,
      },
      { merge: true }
    );
  }

  async createDefaultChannel() {
    let channelData = {
      channel_name: 'office-team',
      admin: 'unknown',
    };
    let defaultChannel = new Channel(channelData);
    let channelObject = defaultChannel.toObject();
    this.databaseService.addChannel(channelObject);
    return channelObject.channel_id;
  }

  async onGuestLogin() {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.guestService.guestData.email, this.guestService.guestData.password);
      await this.createNewUserObject(userCredential);
      this.sendUserToDesktop(userCredential);
      await this.setVarOnlineToTrue(userCredential);
    } catch (error) {
      this.displayWrongMailOrPasswordErrorMessage();
      this.resetInputs();
    }
  }
}
