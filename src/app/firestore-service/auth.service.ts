import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
<<<<<<< HEAD
  private uidSubject = new BehaviorSubject<string | null>(null); // BehaviorSubject für die UID

  constructor() {
    this.watchAuthState(); // Starte die Echtzeitüberwachung
=======
  private uidSubject = new BehaviorSubject<string | null>(null);

  constructor(private firestore: Firestore) {
    this.watchAuthState();
>>>>>>> add135bf184566e83a461697e7db931683934253
  }

  private watchAuthState() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
<<<<<<< HEAD
        this.uidSubject.next(user.uid); // Setze die UID im BehaviorSubject
=======
        this.uidSubject.next(user.uid);
>>>>>>> add135bf184566e83a461697e7db931683934253
        console.log('User is signed in:', user.uid);
        const userDocRef = doc(this.firestore, 'users', user.uid);
        await updateDoc(userDocRef, { online: true });
      } else {
<<<<<<< HEAD
        this.uidSubject.next(null); // Kein Benutzer eingeloggt
=======
        this.uidSubject.next(null);
>>>>>>> add135bf184566e83a461697e7db931683934253
        console.log('No user is signed in.');
      }
    });
  }

  getUIDObservable() {
<<<<<<< HEAD
    return this.uidSubject.asObservable(); // UID als Observable für andere Komponenten
=======
    return this.uidSubject.asObservable();
>>>>>>> add135bf184566e83a461697e7db931683934253
  }

  getUID(): string | null {
<<<<<<< HEAD
    return this.uidSubject.getValue(); // UID direkt aus dem BehaviorSubject abrufen
=======
    return this.uidSubject.getValue();
>>>>>>> add135bf184566e83a461697e7db931683934253
  }

  async logout() {
    const auth = getAuth();
<<<<<<< HEAD
    auth.signOut().then(() => {
      this.uidSubject.next(null); // UID auf null setzen, wenn Benutzer abgemeldet ist
      console.log('User signed out');
    });
=======
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(this.firestore, 'users', user.uid);
      await updateDoc(userDocRef, { online: false });
    }
    await auth.signOut();
    this.uidSubject.next(null);
    console.log('User signed out');
>>>>>>> add135bf184566e83a461697e7db931683934253
  }
}
