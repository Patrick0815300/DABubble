import { Component } from '@angular/core';
import { MainComponentComponent } from './main-component/main-component.component';
import { NewChannelComponent } from '../../archives/new-channel/new-channel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainComponentComponent, NewChannelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'DABubble';
}
