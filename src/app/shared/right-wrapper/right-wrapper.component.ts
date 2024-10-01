import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MessageThreadComponent } from "../../chatarea/thread/message-thread/message-thread.component";
import { OwnMessageThreadComponent } from "../../chatarea/thread/own-message-thread/own-message-thread.component";
import { MessageBoxThreadComponent } from '../../chatarea/thread/message-box-thread/message-box-thread.component';
import { ChatareaServiceService } from '../../firestore-service/chatarea-service.service';
import { ActivatedRoute } from '@angular/router';
import { ChatServiceService } from '../../firestore-service/chat-service.service';

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
export class RightWrapperComponent implements OnInit {
  isVisible: boolean = true;
  selectedThread: any;
  threads: any[] = [];
  channelId: string = '';
  messageId: string = '';

  public chatService = inject(ChatServiceService);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.channelId = this.route.snapshot.paramMap.get('channelId') || '';
    this.messageId = this.route.snapshot.paramMap.get('messageId') || '';


  }

  toggleThread() {
    this.isVisible = !this.isVisible;
  }


}
