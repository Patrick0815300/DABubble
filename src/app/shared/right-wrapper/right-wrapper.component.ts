import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, ViewChild, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MessageThreadComponent } from '../../chatarea/thread/message-thread/message-thread.component';
import { OwnMessageThreadComponent } from '../../chatarea/thread/own-message-thread/own-message-thread.component';
import { MessageBoxThreadComponent } from '../../chatarea/thread/message-box-thread/message-box-thread.component';
import { ChatServiceService } from '../../firestore-service/chat-service.service';
import { Channel } from '../../models/channels/entwickler-team.model';
import { AuthService } from '../../firestore-service/auth.service';
import { Subscription } from 'rxjs';
import { ChannelService } from '../../modules/channel.service';

@Component({
  selector: 'app-right-wrapper',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MessageThreadComponent, OwnMessageThreadComponent, MessageBoxThreadComponent, CommonModule],
  templateUrl: './right-wrapper.component.html',
  styleUrl: './right-wrapper.component.scss',
})
export class RightWrapperComponent {
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  isVisible: boolean = false;
  selectedThread: any;
  threads: any[] = [];
  uid: string | null = null;
  messages: any[] = [];
  threadData: any;
  threadMessages: any[] = [];
  channelId: string = '';
  messageId: string = '';
  threadId: string = '';
  ownMessage: boolean = false;
  answers: string = '';
  channelName: string = '';
  reactions: any[] = [];
  openNextWrapper: 'wrapper_1' | 'wrapper_2' | 'wrapper_3' = 'wrapper_1';

  private chatService = inject(ChatServiceService);
  private authService = inject(AuthService);
  private currentChannel: Channel | null = null;
  private uidSubscription: Subscription | null = null;

  constructor(private channelService: ChannelService) {}

  ngOnInit() {
    this.uidSubscription = this.authService.getUIDObservable().subscribe((uid: string | null) => {
      this.uid = uid;
      if (this.uid) {
        this.chatService.loadActiveChannel();
      }
    });

    this.channelService.openMessageMobile$.subscribe(state => {
      this.openNextWrapper = state;
    });

    this.chatService.currentChannel$.subscribe((channel: Channel | null) => {
      if (channel) {
        this.currentChannel = channel;
        this.channelName = channel.channel_name;
        this.isVisible = channel.thread_open;
      } else {
        this.isVisible = false;
      }
    });

    this.chatService.pickedThread$.subscribe(data => {
      if (data) {
        this.threadData = data;
        this.channelId = data.channelId;
        this.messageId = data.messageId;
        this.threadId = data.id;
        this.ownMessage = this.threadData.senderId === this.uid;
        this.reactions = data.reactions;
        this.loadThreadMessages(this.channelId, this.messageId, this.threadId);
      }
    });
  }

  ngOnDestroy() {
    if (this.uidSubscription) {
      this.uidSubscription.unsubscribe();
    }
  }

  loadThreadMessages(channelId: string, messageId: string, threadId: string) {
    const path = `channels/${channelId}/messages/${messageId}/threads/${threadId}/messages`;
    console.log('RightWrapperComponent: loadThreadMessages aufgerufen mit Path:', path);

    this.chatService.loadMessagesFromPath(path).subscribe(messages => {
      console.log('RightWrapperComponent: threadMessages empfangen:', messages);
      this.threadMessages = messages.map(message => {
        return {
          ...message,
          id: message.id,
        };
      });
      setTimeout(() => {
        this.scrollToBottom();
      }, 250);
    });
  }

  toggleThread() {
    this.isVisible = !this.isVisible;
    if (this.currentChannel) {
      this.chatService.updateChannelThreadState(this.channelId, this.isVisible);
      setTimeout(() => {
        this.scrollToBottom();
      }, 250);
    }
  }

  scrollToBottom(): void {
    this.messageContainer.nativeElement.scroll({
      top: this.messageContainer.nativeElement.scrollHeight,
      behavior: 'smooth',
    });
  }

  handleDialogMobile(val: 'wrapper_1' | 'wrapper_2' | 'wrapper_3') {
    this.channelService.emitOpenMessageMobile(val);
    console.log(val);
  }
}
