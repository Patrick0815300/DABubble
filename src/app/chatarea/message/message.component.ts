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
  @Input() message: any;  // Nachrichtendaten als Input
  @Input() previousMessageDate: string | null = null;  // Für die Divider-Logik

  uid: string = 'tsvZAtPmhQsbvuAp6mi6';
  channelId: string = '';

  constructor(private chatService: ChatServiceService) {
    this.loadActiveChannelId();
  }

  openThread(messageId: string) {
    this.chatService.setThreadDataFromMessage(this.channelId, messageId).then(() => {
      console.log('Thread-Daten geladen:', this.chatService.getThreadData());
    }).catch(error => {
      console.error('Fehler beim Öffnen des Threads:', error);
    });
  }

  loadActiveChannelId() {
    this.chatService.getActiveChannel().subscribe({
      next: (channel: any) => {
        this.channelId = channel.id;  // Dynamische Channel-ID setzen
      },
      error: (err) => {
        console.error('Fehler beim Laden des aktiven Channels:', err);
      }
    });
  }

  // Reaktionslogik mit dynamischer Channel-ID
  reactToMessage(messageId: string, reactionType: string, path: string) {
    if (!this.channelId) {
      console.error('Keine Channel-ID vorhanden.');
      return;
    }
    this.chatService.addReactionToMessage(this.channelId, messageId, reactionType, this.uid, path)
      .then(() => console.log('Reaktion hinzugefügt'))
      .catch(error => console.error('Fehler beim Hinzufügen der Reaktion:', error));
  }

  formatTime(timeString: string): string {
    return this.chatService.formatTime(timeString);
  }

  formatDate(dateString: string): string {
    return this.chatService.formatDate(dateString);
  }
}
