import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChatServiceService } from '../../../firestore-service/chat-service.service';
import { MatMenu } from '@angular/material/menu';

@Component({
  selector: 'app-message-thread',
  standalone: true,
  imports: [MatIconModule, CommonModule, MatMenu],
  templateUrl: './message-thread.component.html',
  styleUrl: './message-thread.component.scss'
})
export class MessageThreadComponent {

  @Input() thread: any;
  @Input() id: string = '';

  threadData: any;
  threadMessages: any[] = [];

  constructor(private chatService: ChatServiceService) {
    this.chatService.pickedThread$.subscribe((data) => {
      if (data) {
        this.threadData = data;
        this.loadThreadMessages();
      }
    });
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
        .then(() => {
          console.log('Reaktion erfolgreich hinzugefügt');
        })
        .catch((error) => {
          console.error('Fehler beim Hinzufügen der Reaktion:', error);
        });
    } else {
      console.error('Fehlende Daten für die Reaktion:', { channelId, messageId, threadId, id });
    }
  }


  formatTime(timeString: string): string {
    return this.chatService.formatTime(timeString);
  }

  formatDate(dateString: string): string {
    return this.chatService.formatDate(dateString);
  }
}
