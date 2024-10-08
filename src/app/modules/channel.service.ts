import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { Channel, ChannelMember, User } from './database.model';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private isChannelSource = new Subject<boolean>();
  private channelMemberSource = new ReplaySubject<ChannelMember[]>(1);
  private logFilteredUserSubject = new ReplaySubject<User[]>(1);
  private logFilteredChannelsSubject = new ReplaySubject<Channel[]>(1);
  private logUserSubject = new ReplaySubject<string[]>(1);
  private logSubject = new BehaviorSubject<boolean>(false);
  showChannelMsg$ = this.isChannelSource.asObservable();
  channelMembers$ = this.channelMemberSource.asObservable();
  userPicked$ = this.logUserSubject.asObservable();
  filtered_users$ = this.logFilteredUserSubject.asObservable();
  filtered_channels$ = this.logFilteredChannelsSubject.asObservable();
  open_update_channel$ = this.logSubject.asObservable();
  isDialogOpen = false;

  constructor() {}

  emitChannelView(isShown: boolean) {
    this.isChannelSource.next(isShown);
  }

  emitChannelMembers(members: ChannelMember[]) {
    this.channelMemberSource.next(members);
  }

  editChannelInfos() {
    this.isDialogOpen = !this.isDialogOpen;
    this.logSubject.next(this.isDialogOpen);
  }

  emitFilteredUsers(users: User[]) {
    this.logFilteredUserSubject.next(users);
  }
  emitFilteredChannels(channels: Channel[]) {
    this.logFilteredChannelsSubject.next(channels);
  }

  emitPickedUser(userId: string[]) {
    this.logUserSubject.next(userId);
  }
}
