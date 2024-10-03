import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Message } from './database.model';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userIdsSource = new Subject<string>();
  private chatSource = new Subject<Message[]>();
  userIds$ = this.userIdsSource.asObservable();
  chatMessages$ = this.chatSource.asObservable();
  constructor() {}

  emitUserId(userId: string) {
    this.userIdsSource.next(userId);
  }
  emitChat(chat: Message[]) {
    console.log('Messages from userService', chat);
    this.chatSource.next(chat);
  }
}
