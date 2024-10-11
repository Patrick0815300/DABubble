import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
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
import { User } from '../models/user/user.model';
import { ChatareaServiceService } from '../firestore-service/chatarea-service.service';
import { MainServiceService } from '../firestore-service/main-service.service';
import { ChangeDetectorRef } from '@angular/core';

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

  channelName: string = '';
  memberIds: string[] = [];
  members: User[] = [];
  messages: any[] = [];
  uid: string = 'cYNWHsbhyTZwZHCZnGD3ujgD2Db2';
  previousMessageDate: string | null = null;
  allChannelsAreFalse: boolean = false;

  constructor(public dialog: MatDialog, private fireService: ChatareaServiceService, private mainService: MainServiceService, private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadActiveChannelData();
    this.checkChannelsStatus();
  }

  checkChannelsStatus() {
    this.fireService.checkIfAllChannelsAreFalse().subscribe({
      next: (allFalse: boolean) => {
        this.allChannelsAreFalse = allFalse;
        if (allFalse) {
          this.clearChannelData();
        }
      }
    });
  }

  clearChannelData() {
    this.channelName = '';
    this.memberIds = [];
    this.members = [];
    this.messages = [];
  }

  loadActiveChannelMessages() {
    this.fireService.getActiveChannel().subscribe((channel: any) => {
      const channelId = channel.id;
      this.loadMessages(channelId);
    });
  }

  loadMessages(channelId: string) {
    if (!channelId) {
      this.messages = [];
      return;
    }

    this.fireService.loadMessages(channelId).subscribe((messages) => {
      this.messages = messages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      setTimeout(() => {
        this.scrollToBottom();
      }, 250);
    });
  }

  loadActiveChannelData() {
    this.fireService.getActiveChannel().subscribe({
      next: (channel: any) => {
        this.channelName = channel.channel_name;
        this.memberIds = channel.member || [];
        this.loadMembers();
        this.loadActiveChannelMessages();
        this.cdRef.detectChanges();
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

  scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Fehler beim automatischen Scrollen:', err);
    }
  }

  formatTime(timeString: string): string {
    return this.mainService.formatTime(timeString);
  }

  formatDate(dateString: string): string {
    return this.mainService.formatDate(dateString);
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