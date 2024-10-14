import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChatServiceService } from '../../../firestore-service/chat-service.service';
import { MatMenu } from '@angular/material/menu';
import { MainServiceService } from '../../../firestore-service/main-service.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileUploadThreadService } from '../../../firestore-service/file-upload-thread.service';

@Component({
  selector: 'app-message-thread',
  standalone: true,
  imports: [MatIconModule, CommonModule, MatMenu],
  templateUrl: './message-thread.component.html',
  styleUrl: './message-thread.component.scss'
})
export class MessageThreadComponent {
  private sanitizer = inject(DomSanitizer);

  @Input() thread: any;
  @Input() id: string = '';

  threadData: any;
  threadMessages: any[] = [];
  fileType: string | null = null;
  fileURL: SafeResourceUrl | null = null;
  fileName: string | null = null;

  constructor(private chatService: ChatServiceService, private mainService: MainServiceService, private fileUploadServiceThread: FileUploadThreadService) {
    this.chatService.pickedThread$.subscribe((data) => {
      if (data) {
        this.threadData = data;
        this.loadThreadMessages();
      }
    });
  }

  ngOnInit() {
    this.loadFileUpload();
  }

  async loadFileUpload() {
    if (this.thread.fileName) {
      this.fileType = this.fileUploadServiceThread.getFileTypeFromFileName(this.thread.fileName)
      this.fileName = this.thread.fileName
      this.fileURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.thread.fileUrl)
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
    return this.mainService.formatTime(timeString);
  }

  formatDate(dateString: string): string {
    return this.mainService.formatDate(dateString);
  }
}
