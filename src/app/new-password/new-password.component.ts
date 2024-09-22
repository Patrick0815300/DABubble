import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FooterComponent } from '../footer/footer.component';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { SignInComponent } from '../sign-in/sign-in.component';
import { FormsModule, NgForm } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [
    MatCardModule,
    FooterComponent,
    MatIconModule,
    RouterModule,
    SignInComponent,
    FormsModule,
    NgIf,
    NgClass
  ],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss'
})
export class NewPasswordComponent {

  mailSent: boolean = false;

  constructor(private router: Router) {

  }

  data = {
    mail: ''
  }


  sendMail(ngForm: NgForm) {
    if (ngForm.valid && ngForm.submitted) {
      this.mailSent = true;
      setTimeout(() => {
        this.mailSent = false;
        ngForm.resetForm();
      }, 2000);
    }
  }
}
