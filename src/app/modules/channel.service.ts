import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { ChannelMember } from './database.model';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private isChannelSource = new Subject<boolean>();
  private channelMemberSource = new ReplaySubject<ChannelMember[]>(1);
  private logSubject = new BehaviorSubject<boolean>(false);
  showChannelMsg$ = this.isChannelSource.asObservable();
  channelMembers$ = this.channelMemberSource.asObservable();
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
}
