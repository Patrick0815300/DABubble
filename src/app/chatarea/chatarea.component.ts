import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
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
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  firestore: Firestore = inject(Firestore);
  channelName: string = '';
  memberIds: string[] = [];
  members: User[] = [];
  messages: any[] = [];
  uid: string = 'cYNWHsbhyTZwZHCZnGD3ujgD2Db2';
  previousMessageDate: string | null = null;

  constructor(public dialog: MatDialog, private fireService: ChatareaServiceService) {
    this.loadActiveChannelData();
  }

  loadActiveChannelMessages() {
    this.fireService.getActiveChannel().subscribe((channel: any) => {
      const channelId = channel.id;
      this.loadMessages(channelId);
    });
  }

  loadMessages(channelId: string) {
    this.fireService.loadMessages(channelId).subscribe((messages) => {
      this.messages = messages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    });
  }

  loadActiveChannelData() {
    this.fireService.getActiveChannel().subscribe({
      next: (channel: any) => {
        this.channelName = channel.name;
        this.loadActiveChannelMessages();
        this.memberIds = channel.member || [];
        this.loadMembers();
      },
      error: (err) => {
        console.error('Kein aktiver Channel gefunden:', err);
      }
    });
  }

  loadMembers() {
    this.members = [];
    this.memberIds.forEach((memberId) => {
      this.fireService.loadDocument('users', memberId).subscribe((user: any) => {
        const userInstance = new User({ ...user });
        this.members.push(userInstance);
      });
    });
  }

  shouldShowDivider(currentMessageTime: string, index: number): boolean {
    const currentMessageDate = new Date(currentMessageTime).toLocaleDateString();
    if (index === 0 || this.previousMessageDate !== currentMessageDate) {
      this.previousMessageDate = currentMessageDate;
      return true;
    }
    return false;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();

    if (date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()) {
      return 'heute';
    }

    return date.toLocaleDateString('de-DE');  // TT.MM.JJJJ Format
  }

  scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Fehler beim automatischen Scrollen:', err);
    }
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