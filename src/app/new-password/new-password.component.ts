import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FooterComponent } from '../footer/footer.component';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { SignInComponent } from '../sign-in/sign-in.component';
import { FormsModule, NgForm } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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

  mailTest = true;

  http = inject(HttpClient);

  onSubmit(ngForm: NgForm) {
    if (ngForm.valid && ngForm.submitted) {
      this.mailSent = true;
      this.sentMail(ngForm)//evtl. wieder löschen
      setTimeout(() => {
        this.mailSent = false;
      }, 2000);
    }
  }

  sentMail(ngForm:any){
    if (ngForm.submitted && ngForm.form.valid && !this.mailTest) {
      this.http.post(this.post.endPoint, this.post.body(this.data))
        .subscribe({
          next: (response) => {
            
            ngForm.resetForm();
          },
          error: (error:any) => {
            console.error(error);
          },
          complete: () => console.info('send post complete'),
        });
    } else if (ngForm.submitted && ngForm.form.valid && this.mailTest) {
      console.log('Mail wurde gesendet!');
      ngForm.resetForm();
    }
  }


  post = { //Domain muss angepasst werden!!
    endPoint: 'https://deineDomain.de/sendMail.php', //Domain anpassen
    body: (payload: any) => JSON.stringify(payload),
    options: {
      headers: {
        'Content-Type': 'text/plain',
        responseType: 'text',
      },
    },
  };


}
