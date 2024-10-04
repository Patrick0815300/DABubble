import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { OwnMessageComponent } from '../own-message/own-message.component';
import { ChatServiceService } from '../../firestore-service/chat-service.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [MatIconModule, CommonModule, OwnMessageComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input() message: any;
  @Input() previousMessageDate: string | null = null;

  uid: string = 'cYNWHsbhyTZwZHCZnGD3ujgD2Db2';
  channelId: string = '';
  answerCount: number = 0;
  lastAnswerTime: string | null = null;
  allReactions: boolean = false;

  constructor(private chatService: ChatServiceService) {
    this.loadActiveChannelId();
  }

  loadThreadDetails() {
    if (this.message && this.channelId) {
      this.chatService.getThreadDetails(this.channelId, this.message.id)
        .then(({ count, lastMessageTime }) => {
          this.answerCount = count;
          this.lastAnswerTime = lastMessageTime ? this.chatService.formatTime(lastMessageTime) : null;
        })
        .catch(error => console.error('Fehler beim Laden der Thread-Details:', error));
    }
  }

  openThread(messageId: string) {
    this.chatService.setThreadDataFromMessage(this.channelId, messageId);
  }

  loadActiveChannelId() {
    this.chatService.getActiveChannel().subscribe({
      next: (channel: any) => {
        this.channelId = channel.id;
        this.loadThreadDetails();
      },
      error: (err) => {
        console.error('Fehler beim Laden des aktiven Channels:', err);
      }
    });
  }

  openReactions() {
    this.allReactions = !this.allReactions;
  }

  reactToMessage(messageId: string, reactionType: string, path: string) {
    this.openReactions();
    if (!this.channelId) {
      console.error('Keine Channel-ID vorhanden.');
      return;
    }
    this.chatService.addReactionToMessage(this.channelId, messageId, reactionType, this.uid, path)
  }

  formatTime(timeString: string): string {
    return this.chatService.formatTime(timeString);
  }

  formatDate(dateString: string): string {
    return this.chatService.formatDate(dateString);
  }
}
