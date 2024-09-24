import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { ChannelDialogComponent } from './channel-dialog/channel-dialog.component';
import { MemberDialogComponent } from './member-dialog/member-dialog.component';
import { AddMemberDialogComponent } from './add-member-dialog/add-member-dialog.component';
import { MessageComponent } from "./message/message.component";
import { OwnMessageComponent } from "./own-message/own-message.component";
import { MessageBoxComponent } from "./message-box/message-box.component";
import { Firestore } from '@angular/fire/firestore';
import { User } from '../models/user/user.model';
import { ChatareaServiceService } from '../firestore-service/chatarea-service.service';

@Component({
  selector: 'app-chatarea',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    ChannelDialogComponent,
    MessageComponent,
    OwnMessageComponent,
    MessageBoxComponent
  ],
  templateUrl: './chatarea.component.html',
  styleUrl: './chatarea.component.scss'
})
export class ChatareaComponent {

  firestore: Firestore = inject(Firestore);
  channelName: string = '';
  memberIds: string[] = [];
  members: User[] = [];

  constructor(public dialog: MatDialog, private fireService: ChatareaServiceService) {
    this.loadActiveChannelData();
  }

  loadActiveChannelData() {
    this.fireService.getActiveChannel().subscribe((channel: any) => {
      this.channelName = channel.name;
      this.memberIds = channel.member || [];
      this.loadMembers();
    });
  }

  loadMembers() {
    this.members = [];
    this.memberIds.forEach((memberId) => {
      this.fireService.loadDocument('user', memberId).subscribe((user: any) => {
        const userInstance = new User({ ...user });
        this.members.push(userInstance);
      });
    });
  }

  openChannelDialog() {
    this.dialog.open(ChannelDialogComponent);
  }

  openMemberDialog() {
    this.dialog.open(MemberDialogComponent);
  }

  openAddMemberDialog() {
    this.dialog.open(AddMemberDialogComponent);
  }
}
