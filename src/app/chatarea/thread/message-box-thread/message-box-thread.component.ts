import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ChatServiceService } from '../../../firestore-service/chat-service.service';
import { Message } from '../../../models/messages/channel-message.model';

@Component({
  selector: 'app-message-box-thread',
  standalone: true,
  imports: [CommonModule, MatIcon, FormsModule],
  templateUrl: './message-box-thread.component.html',
  styleUrl: './message-box-thread.component.scss',
})
export class MessageBoxThreadComponent {
  @Input() channelId: string = '';
  @Input() messageId: string = '';
  @Input() threadId: string = '';
  uid: string = 'cYNWHsbhyTZwZHCZnGD3ujgD2Db2';
  content: string = '';

  constructor(private chatService: ChatServiceService) { }

  async sendMessage() {
    if (this.content.trim() === '') return;
    try {
      const userName = await this.chatService.getUserNameByUid(this.uid);
      const newMessage = new Message({
        content: this.content,
        name: userName,
        senderId: this.uid,
        time: new Date().toISOString(),
        reactions: []
      });

      await this.chatService.addMessageToThread(this.channelId, this.messageId, this.threadId, newMessage);
      this.content = '';
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Nachricht:', error);
    }
  }
}
