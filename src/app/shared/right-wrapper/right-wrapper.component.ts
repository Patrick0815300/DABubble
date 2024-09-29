import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { OwnMessageComponent } from '../../chatarea/own-message/own-message.component';
import { MessageComponent } from '../../chatarea/message/message.component';
import { MessageBoxComponent } from '../../chatarea/message-box/message-box.component';
import { MessageThreadComponent } from "../../chatarea/thread/message-thread/message-thread.component";
import { OwnMessageThreadComponent } from "../../chatarea/thread/own-message-thread/own-message-thread.component";
import { MessageBoxThreadComponent } from '../../chatarea/thread/message-box-thread/message-box-thread.component';

@Component({
  selector: 'app-right-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MessageThreadComponent,
    OwnMessageThreadComponent,
    MessageBoxThreadComponent
  ],
  templateUrl: './right-wrapper.component.html',
  styleUrl: './right-wrapper.component.scss'
})
export class RightWrapperComponent {

}
