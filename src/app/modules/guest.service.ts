import { Injectable } from '@angular/core';
import { User } from './database.model';

@Injectable({
  providedIn: 'root',
})
export class GuestService {
  guestData = {
    id: 'GlCj56f0GgZ4YAWhFQCdWFcWkhU2',
    name: 'bubble guest',
    email: 'guest@mail.com',
    avatar: 'assets/img/profiles/male_avatar.svg',
    password: '123456',
    online: true,
    thread_open: false,
    activeChannelId: '',
  };
  constructor() { }
}
