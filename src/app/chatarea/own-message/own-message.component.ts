import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ChatareaServiceService } from '../../firestore-service/chatarea-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { reactionList } from '../../models/reactions/reaction-list.model';
import { ReactionServiceService } from '../../firestore-service/reaction-service.service';
import { ChatServiceService } from '../../firestore-service/chat-service.service';

@Component({
  selector: 'app-own-message',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    CommonModule,
    FormsModule,
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
  uid: string = 'tsvZAtPmhQsbvuAp6mi6'
  editMode: { [messageId: string]: boolean } = {};
  channelId: string = '';
  answerCount: number = 0;
  lastAnswerTime: string | null = null;
  reactionNames: string[] = [];

  private fireService = inject(ChatareaServiceService);
  constructor(private cdr: ChangeDetectorRef, private chatService: ChatServiceService) {
    this.fireService.loadReactions();
  }

  ngOnInit() {
    this.loadActiveChannelMessages();
    this.renderReact();
    this.loadActiveChannelId();
    this.loadReactionNames();
  }

  async loadReactionNames() {
    if (this.message.reactions && this.message.reactions.length > 0) {
      for (let reaction of this.message.reactions) {
        const name = await this.chatService.getUserNameByUid(reaction.userId);
        this.reactionNames.push(name);
      }
    }
  }

  loadThreadDetails() {
    this.lastAnswerTime = '';
    if (this.message && this.channelId) {
      this.chatService.getThreadDetails(this.channelId, this.message.id, (count, lastMessageTime) => {
        this.answerCount = count;
        this.lastAnswerTime = lastMessageTime ? this.chatService.formatTime(lastMessageTime) : null;
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
      },
      error: (err) => {
        console.error('Fehler beim Laden des aktiven Channels:', err);
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
    this.chatService.addReactionToMessage(this.channelId, messageId, reactionType, this.uid, path)
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
    this.fireService.updateMessage(message.id, { content: message.content })
      .subscribe({
        next: () => {
          this.editMode[message.id] = false;
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
      },
      error: (err) => {
        console.error('Kein aktiver Channel gefunden:', err);
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

  formatTime(timeString: string): string {
    const date = new Date(timeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return 'heute';
    }
    return date.toLocaleDateString('de-DE'); // Format: "TT.MM.JJJJ"
  }

  shouldShowDivider(currentMessageTime: string, index: number): boolean {
    const currentMessageDate = new Date(currentMessageTime).toLocaleDateString();
    if (index === 0 || this.previousMessageDate !== currentMessageDate) {
      this.previousMessageDate = currentMessageDate;
      return true;
    }
    return false;
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