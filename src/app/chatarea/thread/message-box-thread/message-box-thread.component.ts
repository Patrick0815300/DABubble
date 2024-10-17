import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ChatServiceService } from '../../../firestore-service/chat-service.service';
import { Message } from '../../../models/messages/channel-message.model';
import { FileUploadService } from '../../../firestore-service/file-upload.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FileUploadThreadService } from '../../../firestore-service/file-upload-thread.service';
import { User } from '../../../models/user/user.model';
import { ChatareaServiceService } from '../../../firestore-service/chatarea-service.service';
import { MainServiceService } from '../../../firestore-service/main-service.service';
import { AuthService } from '../../../firestore-service/auth.service';

@Component({
  selector: 'app-message-box-thread',
  standalone: true,
  imports: [CommonModule, MatIcon, FormsModule, MatProgressBarModule],
  templateUrl: './message-box-thread.component.html',
  styleUrl: './message-box-thread.component.scss',
})
export class MessageBoxThreadComponent {
  @Input() channelId: string = '';
  @Input() messageId: string = '';
  @Input() threadId: string = '';
  uid: string | null = null;
  content: string = '';
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

  private fileUploadService = inject(FileUploadThreadService);
  private sanitizer = inject(DomSanitizer);
  @ViewChild('fileUploadThread') fileInputThreadElement!: ElementRef;
  @ViewChild('inputBox') inputBox!: ElementRef;

  constructor(private chatService: ChatServiceService, private cdr: ChangeDetectorRef, private fireService: ChatareaServiceService, private authService: AuthService) { }

  ngOnInit() {
    this.uid = this.authService.getUID();
    this.loadChannelMembers();
  }

  toggleLinkDialog() {
    this.linkDialog = !this.linkDialog;
  }

  addMemberToMessage(name: string) {
    this.content = `@${name} `;
    this.toggleLinkDialog();
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.inputBox) {
        this.inputBox.nativeElement.focus();
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
    this.fileURL = null;
    this.fileName = null;
    this.fileType = null;
    this.selectedFile = null;
  }

  openFileDialog() {
    this.fileInputThreadElement.nativeElement.click();
  }

  ngAfterViewInit() {
    this.fileInputThreadElement.nativeElement.addEventListener('change', (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        this.selectedFile = input.files[0];

        const reader = new FileReader();
        reader.onload = () => {
          this.fileURL = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
          this.fileName = this.selectedFile!.name;
          this.fileType = this.fileUploadService.getFileTypeFromFileName(this.fileName);
        };
        reader.readAsDataURL(this.selectedFile);
      }
    });
  }

  uploadFile(channelId: string, messageId: string, threadId: string, threadMessageId: string) {
    if (this.selectedFile) {
      this.isUploading = true;
      this.fileType = this.fileUploadService.getFileTypeFromFileName(this.selectedFile.name);
      this.fileUploadService.uploadFile(this.selectedFile, messageId, (progress) => {
        this.uploadProgress = progress;
        console.log(this.uploadProgress);

      }).then((result: { url: string, fileName: string }) => {
        this.cleanUrl = result.url;
        this.fileURL = this.sanitizer.bypassSecurityTrustResourceUrl(result.url);
        this.fileName = result.fileName;
        this.fileUploadService.updateMessageFileUrl(channelId, messageId, threadId, threadMessageId, this.cleanUrl, this.fileName).then(() => {
          this.content = '';
          this.fileURL = null;
          this.fileName = null;
          this.isUploading = false;
        });
      }).catch((error) => {
        console.error('Fehler beim Hochladen der Datei:', error);
        this.isUploading = false;
      });
      this.selectedFile = null;
    }
  }

  async sendMessage() {
    if (this.content.trim() === '' && !this.selectedFile) return;
    const userName = await this.chatService.getUserNameByUid(this.uid!);
    const newMessage = new Message({
      content: this.content,
      name: userName,
      senderId: this.uid,
      time: new Date().toISOString(),
      reactions: [],
      fileUrl: null,
      fileName: null,
      messageEdit: false
    });
    await this.chatService.addMessageToThread(this.channelId, this.messageId, this.threadId, newMessage);
    const latestMessageId = newMessage.id;
    if (this.selectedFile) {
      this.uploadFile(this.channelId, this.messageId, this.threadId, latestMessageId,);
    }
    this.content = '';
    this.deleteUploadedFile();
  }
}
