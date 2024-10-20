import { ChangeDetectorRef, Component, ElementRef, HostListener, inject, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ChatareaServiceService } from '../../firestore-service/chatarea-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { reactionList } from '../../models/reactions/reaction-list.model';
import { ChatServiceService } from '../../firestore-service/chat-service.service';
import { MainServiceService } from '../../firestore-service/main-service.service';
import { FileUploadService } from '../../firestore-service/file-upload.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../firestore-service/auth.service';
import { Subscription } from 'rxjs';
import { EmojiService } from '../../modules/emoji.service';
import { EmojiPickerComponent } from '../../shared/emoji-picker/emoji-picker.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'app-own-message',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    CommonModule,
    FormsModule,
    EmojiPickerComponent,
    PickerComponent,
    EmojiComponent
  ],
  templateUrl: './own-message.component.html',
  styleUrl: './own-message.component.scss'
})
export class OwnMessageComponent implements OnInit {
  @Input() message: any;
  isReactionBarVisible: { [messageId: string]: boolean } = {};
  private isMenuOpen: { [messageId: string]: boolean } = {};

  messages: any[] = [];
  reactions: any[] = [];
  allReactions: boolean = false;
  selectedReactionPath: string = '';
  previousMessageDate: string | null = null;
  uid: string | null = null;
  editMode: { [messageId: string]: boolean } = {};
  channelId: string = '';
  answerCount: number = 0;
  lastAnswerTime: string | null = null;
  reactionNames: string[] = [];
  fileType: string | null = null;
  fileURL: SafeResourceUrl | null = null;
  fileName: string | null = null;
  avatar: string | null = null;
  messageEdited: boolean = false;
  toggleEmojiPicker: boolean = false;

  private uidSubscription: Subscription | null = null;

  private fireService = inject(ChatareaServiceService);
  private emojiService = inject(EmojiService);
  private sanitizer = inject(DomSanitizer);


  constructor(private emojiRef: ElementRef, private cdr: ChangeDetectorRef, private chatService: ChatServiceService, private mainService: MainServiceService, private fileUploadService: FileUploadService, private authService: AuthService) {
    this.fireService.loadReactions();
  }

  ngOnInit() {
    this.uidSubscription = this.authService.getUIDObservable().subscribe((uid: string | null) => {
      this.uid = uid;
    });
    this.loadFileUpload();
    this.loadActiveChannelMessages();
    this.renderReact();
    this.loadActiveChannelId();
    this.loadReactionNames();
    this.loadAvatar();
    this.emojiService.emoji$.subscribe((emoji: string) => {
      this.message.content = this.message.content ? this.message.content + emoji : emoji;
    });
  }

  ngOnDestroy() {
    if (this.uidSubscription) {
      this.uidSubscription.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.emojiRef.nativeElement.contains(event.target)) {
      this.toggleEmojiPicker = false;
    }
  }

  showEmojiPicker(event: Event) {
    event.stopPropagation();
    this.emojiService.handleShowPicker();
  }

  deleteMessage(messageId: string) {
    this.fireService.getActiveChannel().subscribe((channelData) => {
      const channelId = channelData.id;
      this.fireService.deleteMessageWithSubcollections(channelId, messageId)
    });
  }

  loadAvatar() {
    const docId = this.message.senderId;
    this.fireService.getUserAvatar(docId).subscribe((avatar) => {
      this.avatar = avatar;
    });
  }

  async loadFileUpload() {
    if (this.message.fileName) {
      this.fileType = this.fileUploadService.getFileTypeFromFileName(this.message.fileName)
      this.fileName = this.message.fileName
      this.fileURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.message.fileUrl)
    }
  }

  async loadReactionNames() {
    if (this.message.reactions && this.message.reactions.length > 0) {
      for (let reaction of this.message.reactions) {
        const names = [];
        let currentUserIncluded = false;
        for (let id of reaction.userId) {
          if (id === this.uid) {
            currentUserIncluded = true;
          } else {
            const name = await this.chatService.getUserNameByUid(id);
            names.push(name);
          }
        }
        if (currentUserIncluded) {
          if (names.length === 0) {
            this.reactionNames.push('Du');
          } else if (names.length === 1) {
            this.reactionNames.push(`Du und ${names[0]}`);
          } else {
            this.reactionNames.push(`Du und ${names.length} weitere`);
          }
        } else {
          this.reactionNames.push(names.join(' und '));
        }
      }
    }
  }

  loadThreadDetails() {
    this.lastAnswerTime = '';
    if (this.message && this.channelId) {
      this.chatService.getThreadDetails(this.channelId, this.message.id, (count, lastMessageTime) => {
        this.answerCount = count;
        this.lastAnswerTime = lastMessageTime ? this.mainService.formatTime(lastMessageTime) : null;
      });
    }
  }

  openThread(messageId: string) {
    this.chatService.setThreadDataFromMessage(this.channelId, messageId);
  }

  loadActiveChannelId() {
    this.chatService.getActiveChannel().subscribe({
      next: (channel: any) => {
        this.channelId = channel.id;
        this.loadThreadDetails();
      }
    });
  }

  openReactions() {
    this.allReactions = !this.allReactions;
  }

  onReactionClick(reactionName: string) {
    this.openReactions();
    const selectedReaction = reactionList.find(reaction => reaction.name === reactionName);
    if (selectedReaction) {
      this.selectedReactionPath = selectedReaction.path;
    } else {
      console.error('Keine passende Reaktion gefunden für:', reactionName);
    }
  }

  async renderReact() {
    try {
      this.reactions = await this.fireService.loadReactions();
    } catch (error) {
      console.error('Fehler beim Laden der Reaktionen:', error);
    }
  }

  reactToMessage(messageId: string, reactionType: string, path: string) {
    this.chatService.addReactionToMessage(this.channelId, messageId, reactionType, this.uid!, path)
  }

  editMessage(messageId: string) {
    this.editMode[messageId] = true;
  }

  cancelEdit(messageId: string) {
    this.editMode[messageId] = false;
  }

  isEditingMessage(messageId: string): boolean {
    return this.editMode[messageId] || false;
  }

  saveEditMessage(message: any) {
    this.fireService.updateMessage(message.id, {
      content: message.content,
      messageEdit: true
    })
      .subscribe({
        next: () => {
          this.editMode[message.id] = false;
          this.messageEdited = true;
          this.cdr.detectChanges();
        },
        error: (error) => console.error('Fehler beim Aktualisieren der Nachricht:', error)
      });
  }


  loadActiveChannelMessages() {
    this.fireService.getActiveChannel().subscribe({
      next: (channel: any) => {
        const channelId = channel.id;
        this.loadMessages(channelId);
      }
    });
  }

  loadMessages(channelId: string) {
    this.previousMessageDate = null;
    this.fireService.loadMessages(channelId).subscribe((messages) => {
      this.messages = messages
        .filter(message => message.isOwnMessage)
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      this.cdr.detectChanges();
    });
  }

  shouldShowDivider(currentMessageTime: string, index: number): boolean {
    const currentMessageDate = new Date(currentMessageTime).toLocaleDateString();
    if (index === 0 || this.previousMessageDate !== currentMessageDate) {
      this.previousMessageDate = currentMessageDate;
      return true;
    }
    return false;
  }

  formatTime(timeString: string): string {
    return this.mainService.formatTime(timeString);
  }

  formatDate(dateString: string): string {
    return this.mainService.formatDate(dateString);
  }

  onMenuOpened(messageId: string) {
    setTimeout(() => {
      this.isMenuOpen[messageId] = true;
      this.isReactionBarVisible[messageId] = true;
    });
  }

  onMenuClosed(messageId: string) {
    setTimeout(() => {
      this.isMenuOpen[messageId] = false;
      this.isReactionBarVisible[messageId] = false;
    });
  }

  onMessageHover(messageId: string, isHovering: boolean) {
    if (!this.isMenuOpen[messageId]) {
      setTimeout(() => {
        this.isReactionBarVisible[messageId] = isHovering;
      });
    }
  }
}