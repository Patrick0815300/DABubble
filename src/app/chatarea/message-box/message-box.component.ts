import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChatareaServiceService } from '../../firestore-service/chatarea-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss'
})
export class MessageBoxComponent {
  messageContent: string = '';  // Variable für die Nachricht
  private fireService = inject(ChatareaServiceService);

  sendMessage() {
    if (this.messageContent.trim() === '') return;  // Nur wenn Text vorhanden ist

    this.fireService.getActiveChannel().subscribe({
      next: (channel: any) => {
        const messageData = {
          content: this.messageContent,
          name: 'Aktueller Benutzername',  // Ersetze durch den tatsächlichen Benutzernamen
          time: new Date().toISOString(),  // Zeitstempel mit ISO-Format speichern
          reactions: []  // Leeres Array für Reaktionen
        };

        this.fireService.addMessage(channel.id, messageData)
          .then(() => {
            this.messageContent = '';  // Leere das Input-Feld nach dem Senden
          })
          .catch((error) => {
            console.error('Fehler beim Senden der Nachricht:', error);
          });
      },
      error: (err) => {
        console.error('Kein aktiver Channel gefunden:', err);
      }
    });
  }
}
