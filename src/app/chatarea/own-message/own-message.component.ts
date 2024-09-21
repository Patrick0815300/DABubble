import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-own-message',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './own-message.component.html',
  styleUrl: './own-message.component.scss'
})
export class OwnMessageComponent {
  isReactionBarVisible = false;
  private isMenuOpen = false;

  onMenuOpened() {
    this.isMenuOpen = true;
    this.isReactionBarVisible = true;
  }

  onMenuClosed() {
    this.isMenuOpen = false;
    this.isReactionBarVisible = false;
  }

  onMessageHover(isHovering: boolean) {
    if (!this.isMenuOpen) {
      this.isReactionBarVisible = isHovering;
    }
  }
}
