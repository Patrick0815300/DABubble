import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ChatareaServiceService } from '../../firestore-service/chatarea-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-own-message',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatMenuModule, CommonModule],
  templateUrl: './own-message.component.html',
  styleUrl: './own-message.component.scss'
})
export class OwnMessageComponent implements OnInit {
  isReactionBarVisible: { [messageId: string]: boolean } = {};
  private isMenuOpen: { [messageId: string]: boolean } = {};

  messages: any[] = [];

  private fireService = inject(ChatareaServiceService);

  ngOnInit() {
    this.loadActiveChannelMessages();
  }

  loadActiveChannelMessages() {
    this.fireService.getActiveChannel().subscribe({
      next: (channel: any) => {
        const channelId = channel.id;
        this.loadMessages(channelId);
      },
      error: (err) => {
        console.error('Kein aktiver Channel gefunden:', err);
      }
    });
  }

  loadMessages(channelId: string) {
    this.fireService.loadMessages(channelId).subscribe((messages) => {
      this.messages = messages.sort((a, b) => {
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      });
      this.scrollToBottom();
    });
  }


  scrollToBottom(): void {
    setTimeout(() => {
      const messageContainer = document.querySelector('.message-list');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 0);
  }

  formatTime(timeString: string): string {
    const date = new Date(timeString);
    const hours = date.getHours().toString().padStart(2, '0');  // Stunden mit führender 0, falls nötig
    const minutes = date.getMinutes().toString().padStart(2, '0');  // Minuten mit führender 0, falls nötig
    return `${hours}:${minutes}`;  // Rückgabe im Format HH:MM
  }

  onMenuOpened(messageId: string) {
    this.isMenuOpen[messageId] = true;
    this.isReactionBarVisible[messageId] = true;
  }

  onMenuClosed(messageId: string) {
    this.isMenuOpen[messageId] = false;
    this.isReactionBarVisible[messageId] = false;
  }

  onMessageHover(messageId: string, isHovering: boolean) {
    if (!this.isMenuOpen[messageId]) {
      this.isReactionBarVisible[messageId] = isHovering;
    }
  }
}
