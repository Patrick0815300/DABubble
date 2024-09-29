import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getFirestore, Firestore, collection, doc, addDoc, updateDoc, query, where, getDocs, getDoc, setDoc } from "firebase/firestore";
import { User } from '../../models/user.class';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { SignInComponent } from '../sign-in/sign-in.component';

const firebaseConfig = {
  apiKey: "AIzaSyBSTXdqT4YVS0tJheGnc1evmzz6_kUya4k",
  authDomain: "dabubble-57387.firebaseapp.com",
  projectId: "dabubble-57387",
  storageBucket: "dabubble-57387.appspot.com",
  messagingSenderId: "1040544770849",
  appId: "1:1040544770849:web:1df07c76989e5816c56c60"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore();

@Injectable({
  providedIn: 'root'
})

export class FirebaseLoginService {

  private auth = getAuth();
  db = getFirestore();

  private firestore: Firestore;
  public firebaseConfig = firebaseConfig;


  constructor() {
    this.firestore = firestore;
  }

  /**
   * This function returns the UserRef from Firebase
   * @returns UserRef from Firebase
   */
  getUserRef() {
    return collection(this.firestore, 'users');
  }

  /**
  * This function returns the DocRef from Firebase
  * @param colId id of the collection
  * @param docId id of the document
  * @returns the docId / docRef
  */
  getSingleUserRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  /**
 * This function sets all given data to a structured user Object
 * @param obj userdata
 * @returns the user object
 */
  setUserObject(obj: any): User {
    return {
      id: obj.id || "default",
      name: obj.name || "",
      mail: obj.mail || "",
      password: obj.password || "",
      avatar: obj.avatar || "default",
      online: obj.online || false,
    }
  }

  /**
   * This function creates a User in the Firebase AUthentivator
   * @param email E-Mail of the user
   * @param password Password of the user
   * @param name Jame of the user
   * @returns the user ID
   */
  async addUserInAuth(email: string, password: string, name: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      this.saveUserDataToDatabase(user.uid, user.email, name, password);
      //console.log('Benutzer erfolgreich registriert und in Firestore gespeichert mit UID:', user.uid);
      return user.uid;
    } catch (error) {
      console.error('Fehler bei der Registrierung:', error);
      return "error";

    }
  }

  /**
   * This function creates a User in the Firestore database
   * @param uid id of the user
   * @param email E-Mail of the user
   */
  saveUserDataToDatabase(uid: string, email: any, name: string, password: string) {
    // Referenziere das Dokument mit der UID als DocID
    const userRef = doc(this.db, "users", uid);
    setDoc(userRef, {
      name: name,
      email: email,
      // password: password,
      online: false,
      avatar: '',
    })
      .then(() => {
        return uid;
        //console.log("Benutzer erfolgreich in der Datenbank gespeichert.");
      })
      .catch((error) => {
        console.error("Fehler beim Speichern des Benutzers:", error);
      });
  }

  /**
   * This functionupdates the avatar of the user
   * @param chosenAvatar the link of the profil picture
   * @param id the user-id (DocRef of firebase)
   */
  async updateAvatar(chosenAvatar: string, id: any) {
    let user = doc(this.db, "users", id)
    await updateDoc(user, {
      avatar: chosenAvatar,
    });
  }

  /**
   * This function checks, if the entered Email exists in die firebase database or not
   * @param email entered Email
   * @returns the User who belongs to the entered mail-adress
   */
  async gettingQuery(searchDocRef: string, value: string) {
    const q = query(this.getUserRef(), where(searchDocRef, "==", value));
    const querySnapshot = await getDocs(q);
    return querySnapshot;
  }

  /**
 * This function checks, if the entered Email exists in the firebase database or not.
 * @param email in the form entered Email
 * @returns true / false
 */
  async findUserWithRef(searchRef: string, value: string) {
    try {
      const querySnapshot = await this.gettingQuery(searchRef, value);
      return !querySnapshot.empty;
    } catch (err) {
      console.error("Error checking email existence: ", err);
      return false;
    }
  }

}
