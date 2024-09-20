import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    MatCardModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {

}
