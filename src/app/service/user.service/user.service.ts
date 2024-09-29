import { Injectable } from '@angular/core';
import { User } from '../../../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  private user: User = new User;

  setUser(user: any) {
    this.user = user;
  }

  getUser() {
    return this.user;
  }

}
