import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ChatServiceService } from '../../../firestore-service/chat-service.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-own-message-thread',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, CommonModule, FormsModule],
  templateUrl: './own-message-thread.component.html',
  styleUrl: './own-message-thread.component.scss'
})
export class OwnMessageThreadComponent {
  editMode: boolean = false;

  @Input() thread: any;

  constructor(private chatService: ChatServiceService) { }

  formatTime(timeString: string): string {
    return this.chatService.formatTime(timeString);
  }

  formatDate(dateString: string): string {
    return this.chatService.formatDate(dateString);
  }


  editMessage() {

  }

  cancelEdit() {

  }

  saveEditMessage() {

  }

  isEditingMessage() {

  }
}
