import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MessageThreadComponent } from "../../chatarea/thread/message-thread/message-thread.component";
import { OwnMessageThreadComponent } from "../../chatarea/thread/own-message-thread/own-message-thread.component";
import { MessageBoxThreadComponent } from '../../chatarea/thread/message-box-thread/message-box-thread.component';
import { ChatServiceService } from '../../firestore-service/chat-service.service';
import { Channel } from '../../models/channels/entwickler-team.model';
import { AuthService } from '../../firestore-service/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-right-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MessageThreadComponent,
    OwnMessageThreadComponent,
    MessageBoxThreadComponent,
    CommonModule
  ],
  templateUrl: './right-wrapper.component.html',
  styleUrl: './right-wrapper.component.scss'
})
export class RightWrapperComponent {
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

  private chatService = inject(ChatServiceService);
  private authService = inject(AuthService)
  private currentChannel: Channel | null = null;
  private uidSubscription: Subscription | null = null;

  ngOnInit() {
    this.uidSubscription = this.authService.getUIDObservable().subscribe((uid: string | null) => {
      this.uid = uid;
      if (this.uid) {
        this.chatService.loadActiveChannel();
      }
    });
    this.chatService.currentChannel$.subscribe((channel: Channel | null) => {
      if (channel) {
        this.currentChannel = channel;
        this.channelName = channel.channel_name
        this.isVisible = channel.thread_open;
      } else {
        this.isVisible = false;
      }
    });

    this.chatService.pickedThread$.subscribe((data) => {
      if (data) {
        this.threadData = data;
        this.channelId = data.channelId;
        this.messageId = data.messageId;
        this.threadId = data.id;
        this.ownMessage = this.threadData.senderId === this.uid;
        this.reactions = data.reactions
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
    this.chatService.loadMessagesFromPath(path).subscribe((messages) => {
      this.threadMessages = messages.map(message => {
        return {
          ...message,
          id: message.id
        };
      });
    });
  }

  toggleThread() {
    console.log('currentChannel: ', this.currentChannel);

    this.isVisible = !this.isVisible;
    if (this.currentChannel) {
      this.chatService.updateChannelThreadState(this.channelId, this.isVisible);
    }
  }
}
