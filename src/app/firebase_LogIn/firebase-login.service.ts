import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getFirestore, Firestore, collection, doc, addDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { User } from '../../models/user.class';

const firebaseConfig = {
  apiKey: "AIzaSyDRsqDHFGSfO5l5pWAsKLgEisUaiiqAzrI",
  authDomain: "dabubble-f7b64.firebaseapp.com",
  projectId: "dabubble-f7b64",
  storageBucket: "dabubble-f7b64.appspot.com",
  messagingSenderId: "176717073486",
  appId: "1:176717073486:web:f3bc57b168720f8879071f"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

@Injectable({
  providedIn: 'root'
})

export class FirebaseLoginService {

  private firestore: Firestore;


  constructor() {
    this.firestore = firestore;
  }

  /**
   * This function returns the UserRef from Firebase
   * @returns UserRef from Firebase
   */
  getUserRef() {
    return collection(this.firestore, 'accounts');
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
 * This function adds a new User to the Firebase
 * @param item the Document / the userdata
 */
  async addUser(item: {}) {
    await addDoc(this.getUserRef(), item).catch(
      (err) => {
        console.error(err);
      }
    ).then(
      (docRef) => {
        // console.log("Document written with ID: ", docRef?.id);//colID          
        this.addingdocRefToUser(item, docRef?.id);
      }
    )
  }

  /**
   * This function adds the automatically cenerated id from firebase to the userdoc
   * @param item the Document / the userdata
   * @param docId the generated docRef
   */
  async addingdocRefToUser(item: any, docId: any) {
    item.id = docId;
    await updateDoc(this.getSingleUserRef("accounts", docId), item).catch(
      (err) => { console.log(err); }
    )
  }

  async updateAvatar(chosenAvatar: string, id:any){
    let user = this.getSingleUserRef('accounts', id);
    await updateDoc(user,{
      avatar: chosenAvatar
    });
  }

}
