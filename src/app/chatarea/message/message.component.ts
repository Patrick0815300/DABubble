import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { OwnMessageComponent } from '../own-message/own-message.component';
import { ChatServiceService } from '../../firestore-service/chat-service.service';
import { MainServiceService } from '../../firestore-service/main-service.service';

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
  reactionNames: string[] = [];

  constructor(private chatService: ChatServiceService, private mainService: MainServiceService) { }

  ngOnInit() {
    this.loadActiveChannelId();
    this.loadReactionNames()
  }

  async loadReactionNames() {
    if (this.message.reactions && this.message.reactions.length > 0) {
      for (let reaction of this.message.reactions) {
        const names = [];
        let currentUserIncluded = false;
        for (let id of reaction.userId) {
          if (id === this.uid) {
            currentUserIncluded = true;
          } else {
            const name = await this.chatService.getUserNameByUid(id);
            names.push(name);
          }
        }
        if (currentUserIncluded) {
          if (names.length === 0) {
            this.reactionNames.push('Du');
          } else if (names.length === 1) {
            this.reactionNames.push(`Du und ${names[0]}`);
          } else {
            this.reactionNames.push(`Du und ${names.length} weitere`);
          }
        } else {
          this.reactionNames.push(names.join(' und '));
        }
      }
    }
  }

  loadThreadDetails() {
    if (this.message && this.channelId) {
      this.chatService.getThreadDetails(this.channelId, this.message.id, (count, lastMessageTime) => {
        this.answerCount = count;
        this.lastAnswerTime = lastMessageTime ? this.mainService.formatTime(lastMessageTime) : null;
      });
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
    return this.mainService.formatTime(timeString);
  }

  formatDate(dateString: string): string {
    return this.mainService.formatDate(dateString);
  }
}
