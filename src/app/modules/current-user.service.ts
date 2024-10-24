import { Injectable, OnInit } from '@angular/core';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  private authUserSubject = new BehaviorSubject<string | null>(null);
  userID$ = this.authUserSubject.asObservable();
  constructor() {
    this.userSession();
  }

  userSession() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user: User | null) => {
      if (user && user !== null) {
        this.authUserSubject.next(user.uid);
      } else {
        this.authUserSubject.next(null);
      }
    });
  }
}
