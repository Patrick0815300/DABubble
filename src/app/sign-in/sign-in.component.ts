import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FooterComponent } from '../footer/footer.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ChooseAvatarComponent } from '../choose-avatar/choose-avatar.component';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    FooterComponent,
    MatCardModule,
    MatIconModule,
    RouterModule,
    ChooseAvatarComponent
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {

}
