import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChatareaServiceService } from '../../firestore-service/chatarea-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileUploadService } from '../../firestore-service/file-upload.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule, MatProgressBarModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss'
})
export class MessageBoxComponent {
  uid: string = 'cYNWHsbhyTZwZHCZnGD3ujgD2Db2'
  messageContent: string = '';
  channelName: string = '';
  selectedFile: File | null = null;
  fileURL: SafeResourceUrl | null = null;
  fileName: string | null = null;
  uploadProgress: number = 0;
  isUploading: boolean = false;
  fileType: string | null = null;
  private fireService = inject(ChatareaServiceService);
  public fileUploadService = inject(FileUploadService);
  private sanitizer = inject(DomSanitizer);

  ngOnInit() {
    this.loadActiveChannelName();
  }

  deleteUploadedFile() {
    if (this.fileURL) {
      const filePath = `uploads/${this.uid}/${this.fileName}`;
      this.fileUploadService.deleteFile(filePath).then(() => {
        this.fileURL = null;
        this.fileName = null;
      }).catch((error) => {
        console.error('Fehler beim Löschen der Datei:', error);
      });
    }
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
      this.isUploading = true;
      this.fileType = this.fileUploadService.getFileTypeFromFileName(this.selectedFile.name);
      this.fileUploadService.uploadFile(this.selectedFile, this.uid, (progress) => {
        this.uploadProgress = progress;
      }).then((result: { url: string, fileName: string }) => {
        this.fileURL = this.sanitizer.bypassSecurityTrustResourceUrl(result.url);
        this.fileName = result.fileName;
        setTimeout(() => {
          this.isUploading = false;
        }, 1000);
      }).catch((error) => {
        console.error('Fehler beim Hochladen der Datei:', error);
        this.isUploading = false;
      });
      this.selectedFile = null;
    }
  }

  sendMessage() {
    if (this.messageContent.trim() === '' && !this.fileURL) {
      return;
    }
    this.fireService.loadDocument('users', this.uid).subscribe({
      next: (user: any) => {
        const userName = `${user.name}`;
        this.fireService.getActiveChannel().subscribe({
          next: (channel: any) => {
            let content = this.messageContent;
            const messageData = {
              content: content,
              name: userName,
              time: new Date().toISOString(),
              reactions: [],
              senderId: this.uid,
              fileUrl: this.fileURL ? this.fileURL.toString() : null,
              fileName: this.fileName || null
            };
            this.fireService.addMessage(channel.id, messageData).then(() => {
              this.messageContent = '';
              this.fileURL = null;
              this.fileName = null;
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
