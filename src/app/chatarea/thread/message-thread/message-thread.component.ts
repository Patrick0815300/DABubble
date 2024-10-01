import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChatServiceService } from '../../../firestore-service/chat-service.service';

@Component({
  selector: 'app-message-thread',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './message-thread.component.html',
  styleUrl: './message-thread.component.scss'
})
export class MessageThreadComponent {
  @Input() thread: any;

  constructor(private chatService: ChatServiceService) { }

  formatTime(timeString: string): string {
    return this.chatService.formatTime(timeString);
  }

  formatDate(dateString: string): string {
    return this.chatService.formatDate(dateString);
  }
}
