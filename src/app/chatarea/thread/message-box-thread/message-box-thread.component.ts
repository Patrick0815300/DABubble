import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-message-box-thread',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './message-box-thread.component.html',
  styleUrl: './message-box-thread.component.scss',
  template: `
    <input #inputBox type="text" (keyup.enter)="send(inputBox.value)">
  `
})
export class MessageBoxThreadComponent {
  @Output() sendMessage = new EventEmitter<string>();

  send(value: string) {
    if (value.trim().length > 0) {
      this.sendMessage.emit(value); // sendMessage-Ereignis mit einem string auslösen
    }
  }
}
