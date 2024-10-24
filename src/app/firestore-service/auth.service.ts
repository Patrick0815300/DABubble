import { Injectable } from '@angular/core';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private uidSubject = new BehaviorSubject<string | null>(null); // BehaviorSubject für die UID

  constructor() {
    this.watchAuthState(); // Starte die Echtzeitüberwachung
  }

  // Überwache den Auth-Status und aktualisiere das BehaviorSubject
  private watchAuthState() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        this.uidSubject.next(user.uid); // Setze die UID im BehaviorSubject
        console.log('User is signed in:', user.uid);
      } else {
        this.uidSubject.next(null); // Kein Benutzer eingeloggt
        console.log('No user is signed in.');
      }
    });
  }

  // Funktion, um das BehaviorSubject als Observable zurückzugeben
  getUIDObservable() {
    return this.uidSubject.asObservable(); // UID als Observable für andere Komponenten
  }

  // Funktion, um die aktuelle UID synchron zu erhalten
  getUID(): string | null {
    return this.uidSubject.getValue(); // UID direkt aus dem BehaviorSubject abrufen
  }

  // Benutzer abmelden
  logout() {
    const auth = getAuth();
    auth.signOut().then(() => {
      this.uidSubject.next(null); // UID auf null setzen, wenn Benutzer abgemeldet ist
      console.log('User signed out');
    });
  }
}
