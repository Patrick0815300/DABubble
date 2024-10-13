import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ChatServiceService } from '../../../firestore-service/chat-service.service';
import { FormsModule } from '@angular/forms';
import { MainServiceService } from '../../../firestore-service/main-service.service';

@Component({
  selector: 'app-own-message-thread',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, CommonModule, FormsModule],
  templateUrl: './own-message-thread.component.html',
  styleUrl: './own-message-thread.component.scss'
})
export class OwnMessageThreadComponent {
  @Input() thread: any;
  @Input() id: string = '';

  editMode: boolean = false;
  threadData: any;
  showReactions: boolean = false
  reactions: any[] = [];
  threadMessages: any[] = [];
  reactionNames: string[] = [];
  uid: string = 'cYNWHsbhyTZwZHCZnGD3ujgD2Db2'

  constructor(private chatService: ChatServiceService, private mainService: MainServiceService) {
    this.chatService.pickedThread$.subscribe((data) => {
      if (data) {
        this.threadData = data;
        this.loadThreadMessages();
      }
    });
  }

  ngOnInit() {
    this.loadReactionNames();
  }

  async loadReactionNames() {
    if (this.thread.reactions && this.thread.reactions.length > 0) {
      for (let reaction of this.thread.reactions) {
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

        // Wenn der aktuelle Nutzer ("Du") in den Reaktionen ist
        if (currentUserIncluded) {
          if (names.length === 0) {
            this.reactionNames.push('Du');
          } else if (names.length === 1) {
            this.reactionNames.push(`Du und ${names[0]}`);
          } else {
            this.reactionNames.push(`Du und ${names.length} weitere`);
          }
        } else {
          // Wenn der aktuelle Nutzer nicht in den Reaktionen ist, normale Auflistung der Namen
          this.reactionNames.push(names.join(' und '));
        }
      }
    }
  }

  loadThreadMessages(): void {
    const { channelId, messageId, id: threadId } = this.threadData;
    this.chatService.loadThreadMessages(channelId, messageId, threadId).then((messages) => {
      this.threadMessages = messages;
    });
  }

  reactToThreadMessage(reactionType: string, path: string, id: string): void {
    const { channelId, messageId, id: threadId } = this.threadData;
    if (channelId && messageId && threadId && id) {
      this.chatService.addReactionToThreadMessage(channelId, messageId, threadId, reactionType, path, id)
    }
  }

  toggleReactions() {
    this.showReactions = !this.showReactions
  }

  formatTime(timeString: string): string {
    return this.mainService.formatTime(timeString);
  }

  formatDate(dateString: string): string {
    return this.mainService.formatDate(dateString);
  }


  editMessage() {

  }

  cancelEdit() {

  }

  saveEditMessage() {

  }

  isEditingMessage() {

  }
}
