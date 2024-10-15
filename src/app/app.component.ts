import { Component } from '@angular/core';
import { MainComponentComponent } from './main-component/main-component.component';
import { NewChannelComponent } from '../../archives/new-channel/new-channel.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainComponentComponent, NewChannelComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'DABubble';
}
