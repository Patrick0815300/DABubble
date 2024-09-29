import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChatareaServiceService } from '../../firestore-service/chatarea-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getDoc, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss'
})
export class MessageBoxComponent {
  messageContent: string = '';
  channelName: string = '';
  private fireService = inject(ChatareaServiceService);

  ngOnInit() {
    this.loadActiveChannelName();
  }

  sendMessage() {
    if (this.messageContent.trim() === '') return;
    const senderId = "tsvZAtPmhQsbvuAp6mi6";  // Aktuell eingeloggter Benutzer (z.B. von Auth abgerufen)
    this.fireService.loadDocument('user', senderId).subscribe({
      next: (user: any) => {
        const userName = `${user.firstName} ${user.lastName}`;
        this.fireService.getActiveChannel().subscribe({
          next: (channel: any) => {
            const messageData = {
              content: this.messageContent,
              name: userName,
              time: new Date().toISOString(),
              reactions: [],
              senderId: senderId
            };

            this.fireService.addMessage(channel.id, messageData)
              .then(() => {
                this.messageContent = '';
              })
              .catch((error) => {
                console.error('Fehler beim Senden der Nachricht:', error);
              });
          },
          error: (err) => {
            console.error('Kein aktiver Channel gefunden:', err);
          }
        });
      },
      error: (error) => {
        console.error('Fehler beim Abrufen des Benutzernamens:', error);
      }
    });
  }

  async loadActiveChannelName() {
    this.fireService.getActiveChannel().subscribe((channel: any) => {
      const channelId = channel.id;
      console.log(channelId);

      this.fireService.loadDocument('channel', channelId).subscribe((channelDoc: any) => {
        const channelData = channelDoc;
        this.channelName = channelData.name;
      });
    });
  }
}