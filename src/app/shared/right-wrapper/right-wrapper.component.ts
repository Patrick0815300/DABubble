import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MessageThreadComponent } from "../../chatarea/thread/message-thread/message-thread.component";
import { OwnMessageThreadComponent } from "../../chatarea/thread/own-message-thread/own-message-thread.component";
import { MessageBoxThreadComponent } from '../../chatarea/thread/message-box-thread/message-box-thread.component';
import { ChatServiceService } from '../../firestore-service/chat-service.service';
import { Channel } from '../../models/channels/entwickler-team.model';

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
  uid: string = 'cYNWHsbhyTZwZHCZnGD3ujgD2Db2';
  messages: any[] = [];
  threadData: any;
  threadMessages: any[] = [];
  channelId: string = '';
  messageId: string = '';
  threadId: string = '';
  ownMessage: boolean = false;
  answers: string = '';
  channelName: string = '';

  private chatService = inject(ChatServiceService);
  private currentChannel: Channel | null = null;

  ngOnInit() {
    this.chatService.loadActiveChannel();
    this.chatService.currentChannel$.subscribe((channel: Channel | null) => {
      if (channel) {
        this.currentChannel = channel;
        this.channelName = channel.channel_name
        this.isVisible = channel.thread_open;
      } else {
        !this.isVisible
      }
    });

    this.chatService.pickedThread$.subscribe((data) => {
      if (data) {
        this.threadData = data;
        this.channelId = data.channelId;
        this.messageId = data.messageId;
        this.threadId = data.id;
        this.ownMessage = this.threadData.senderId === this.uid;
        this.loadThreadMessages(this.channelId, this.messageId, this.threadId);
      }
    });
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
    this.isVisible = !this.isVisible;
    if (this.currentChannel) {
      this.chatService.updateChannelThreadState(this.channelId, this.isVisible);
    }
  }
}
