import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { Channel, Message, User } from './database.model';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  // private channelIdsSource = new Subject<string>();
  private chatSource = new Subject<Message[]>();
  private channelSource = new ReplaySubject<Channel>(1);
  private channelMsgSource = new Subject<Message[]>();
  private userIdsSource = new ReplaySubject<string>(1);
  private userSource = new ReplaySubject<User>(1);
  private officeSource = new Subject<string[]>();
  userIds$ = this.userIdsSource.asObservable();
  // channelIds$ = this.channelIdsSource.asObservable();
  channel$ = this.channelSource.asObservable();
  selectedUser$ = this.userSource.asObservable();
  chatMessages$ = this.chatSource.asObservable();
  officeMembers$ = this.officeSource.asObservable();
  channelMessages$ = this.channelMsgSource.asObservable();
  constructor() {}

  emitUserId(userId: string) {
    this.userIdsSource.next(userId);
  }

  emitSelectedUser(user: User) {
    this.userSource.next(user);
  }

  // emitChannelId(channelId: string) {
  //   this.channelIdsSource.next(channelId);
  // }

  emitChannel(channel: Channel) {
    this.channelSource.next(channel);
  }

  emitChat(chat: Message[]) {
    this.chatSource.next(chat);
  }

  emitChannelMessage(msg: Message[]) {
    this.channelMsgSource.next(msg);
  }
  emitOfficeMembers(members: string[]) {
    this.officeSource.next(members);
  }
}
