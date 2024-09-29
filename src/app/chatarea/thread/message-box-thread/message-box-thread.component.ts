import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-message-box-thread',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './message-box-thread.component.html',
  styleUrl: './message-box-thread.component.scss'
})
export class MessageBoxThreadComponent {
  sendMessage() { }
}
