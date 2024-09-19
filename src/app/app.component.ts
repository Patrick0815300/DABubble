import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatareaComponent } from "./chatarea/chatarea.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ChatareaComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DABubble';
}
