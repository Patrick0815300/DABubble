import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FooterComponent } from '../footer/footer.component';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { SignInComponent } from '../sign-in/sign-in.component';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [
    MatCardModule,
    FooterComponent,
    MatIconModule,
    RouterModule,
    SignInComponent,
  ],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss'
})
export class NewPasswordComponent {

  mailSent:boolean = false;

constructor(private router: Router){

}

  sendMail(){
    this.mailSent = true;
    setTimeout(() => {
      this.mailSent = false;
    },2000);
  }
}
