import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ChatServiceService } from '../../../firestore-service/chat-service.service';
import { FormsModule } from '@angular/forms';

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

  constructor(private chatService: ChatServiceService) {
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
    console.log(this.thread.reactions);

    if (this.thread.reactions && this.thread.reactions.length > 0) {
      for (let reaction of this.thread.reactions) {
        const name = await this.chatService.getUserNameByUid(reaction.userId);
        this.reactionNames.push(name);
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
    return this.chatService.formatTime(timeString);
  }

  formatDate(dateString: string): string {
    return this.chatService.formatDate(dateString);
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
