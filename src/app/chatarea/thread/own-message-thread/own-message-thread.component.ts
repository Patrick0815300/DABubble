import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-own-message-thread',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, CommonModule],
  templateUrl: './own-message-thread.component.html',
  styleUrl: './own-message-thread.component.scss'
})
export class OwnMessageThreadComponent {
  editMode: boolean = false;


  editMessage() {

  }

  cancelEdit() {

  }

  saveEditMessage() {

  }

  isEditingMessage() {

  }
}
