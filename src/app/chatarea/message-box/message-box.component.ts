import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChatareaServiceService } from '../../firestore-service/chatarea-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileUploadService } from '../../firestore-service/file-upload.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule, MatProgressBarModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss'
})
export class MessageBoxComponent {
  messageContent: string = '';
  channelName: string = '';
  selectedFile: File | null = null;
  fileURL: string | null = null;
  fileName: string | null = null;
  uploadProgress: number = 0;
  isUploading: boolean = false;
  private fireService = inject(ChatareaServiceService);
  public fileUploadService = inject(FileUploadService);

  ngOnInit() {
    this.loadActiveChannelName();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadFile();
    }
  }

  uploadFile() {
    if (this.selectedFile) {
      this.isUploading = true;  // Gesamter Prozess beginnt
      const userId = 'cYNWHsbhyTZwZHCZnGD3ujgD2Db2'; // Beispiel-User-ID
      this.fileUploadService.uploadFile(this.selectedFile, userId, (progress) => {
        this.uploadProgress = progress;  // Fortschritt in Prozent aktualisieren
      }).then((result: { url: string, fileName: string }) => {
        this.fileURL = result.url;  // URL der hochgeladenen Datei speichern
        this.fileName = result.fileName;  // Dateiname speichern
        setTimeout(() => {
          this.isUploading = false;  // Gesamter Prozess abgeschlossen, Fortschrittsanzeige ausblenden
        }, 1000);  // 1 Sekunde Verzögerung nach dem Abschluss des gesamten Prozesses
      }).catch((error) => {
        console.error('Fehler beim Hochladen der Datei:', error);
        this.isUploading = false;  // Bei Fehler Fortschrittsanzeige ausblenden
      });
      this.selectedFile = null; // Zurücksetzen nach dem Upload
    } else {
      console.error('Keine Datei ausgewählt.');
    }
  }

  sendMessage() {
    if (this.messageContent.trim() === '' && !this.fileURL) return;  // Nachricht darf nicht leer sein, es sei denn, es gibt eine Datei

    const senderId = "cYNWHsbhyTZwZHCZnGD3ujgD2Db2";

    this.fireService.loadDocument('users', senderId).subscribe({
      next: (user: any) => {
        const userName = `${user.name}`;

        this.fireService.getActiveChannel().subscribe({
          next: (channel: any) => {
            let content = this.messageContent;

            // Wenn eine Datei hochgeladen wurde, erstelle den HTML-String für den Download-Link
            if (this.fileURL && this.fileName) {
              content = `<div class="upload">Datei: <a href="${this.fileURL}" target="_blank">${this.fileName}</a></div>`;
            }

            const messageData = {
              content: content,  // Nachricht oder Datei-Link
              name: userName,
              time: new Date().toISOString(),
              reactions: [],
              senderId: senderId
            };

            // Nachricht mit Text oder Datei-Link in Firestore speichern
            this.fireService.addMessage(channel.id, messageData).then(() => {
              this.messageContent = '';  // Eingabefeld zurücksetzen
              this.fileURL = null;       // Datei-URL zurücksetzen
              this.fileName = null;      // Dateiname zurücksetzen
            });
          }
        });
      }
    });
  }


  async loadActiveChannelName() {
    this.fireService.getActiveChannel().subscribe((channel: any) => {
      const channelId = channel.id;
      this.fireService.loadDocument('channels', channelId).subscribe((channelDoc: any) => {
        const channelData = channelDoc;
        this.channelName = channelData.name;
      });
    });
  }
}
