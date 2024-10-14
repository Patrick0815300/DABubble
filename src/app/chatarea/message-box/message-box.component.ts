import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChatareaServiceService } from '../../firestore-service/chatarea-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileUploadService } from '../../firestore-service/file-upload.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { User } from '../../models/user/user.model';
import { MainServiceService } from '../../firestore-service/main-service.service';
import { AuthService } from '../../firestore-service/auth.service';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule, MatProgressBarModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss'
})
export class MessageBoxComponent implements AfterViewInit {
  uid: string | null = null;
  messageContent: string = '';
  channelName: string = '';
  selectedFile: File | null = null;
  fileURL: SafeResourceUrl | null = null;
  cleanUrl: string | null = null;
  fileName: string | null = null;
  uploadProgress: number = 0;
  isUploading: boolean = false;
  fileType: string | null = null;
  users: User[] = [];
  memberIds: string[] = [];
  linkDialog: boolean = false

  private fireService = inject(ChatareaServiceService);
  private fileUploadService = inject(FileUploadService);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('fileUpload') fileInputElement!: ElementRef;
  @ViewChild('messageTextArea') messageTextArea!: ElementRef;

  constructor(private cdr: ChangeDetectorRef, private mainService: MainServiceService, private authService: AuthService) { }

  ngOnInit() {
    this.uid = this.authService.getUID();
    this.loadActiveChannelName();
    this.loadChannelMembers();
  }

  toggleLinkDialog() {
    this.linkDialog = !this.linkDialog;
  }

  addMemberToMessage(name: string) {
    this.messageContent = `@${name} `;
    this.toggleLinkDialog();
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.messageTextArea) {
        this.messageTextArea.nativeElement.focus();
      }
    }, 0);
  }

  loadChannelMembers() {
    this.fireService.getActiveChannel().subscribe((channel: any) => {
      this.memberIds = channel.member || [];
      this.loadUsers();
    });
  }

  loadUsers() {
    this.users = [];
    this.memberIds.forEach((memberId) => {
      this.fireService.loadDocument('users', memberId).subscribe((user: any) => {
        const userInstance = new User({ ...user });
        this.users.push(userInstance);
      });
    });
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

  openFileDialog() {
    this.fileInputElement.nativeElement.click();  // Öffnet das Dateiauswahlfenster
  }

  ngAfterViewInit() {
    this.fileInputElement.nativeElement.addEventListener('change', (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        const selectedFile = input.files[0];
        this.selectedFile = selectedFile
        this.uploadFile();  // Datei zum Hochladen weitergeben
      }
    });
  }

  uploadFile() {
    if (this.selectedFile) {
      this.isUploading = true;
      this.fileType = this.fileUploadService.getFileTypeFromFileName(this.selectedFile.name);
      this.fileUploadService.uploadFile(this.selectedFile, this.uid!, (progress) => {
        this.uploadProgress = progress;
      }).then((result: { url: string, fileName: string }) => {
        this.cleanUrl = result.url
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
    this.fireService.loadDocument('users', this.uid!).subscribe({
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
              fileUrl: this.cleanUrl,
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
