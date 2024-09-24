import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FooterComponent } from '../footer/footer.component';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { SignInComponent } from '../sign-in/sign-in.component';
import { FormsModule, NgForm } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FirebaseLoginService } from '../firebase_LogIn/firebase-login.service';

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
  wrongMail: boolean = false;

  constructor(private router: Router, private firebase: FirebaseLoginService) {

  }

  data = {
    mail: ''
  }

  mail: string = '';

  mailTest = true;

  http = inject(HttpClient);

  /**
   * This function trigggers functions who send a Mail to the given mail adress to change the password
   * @param ngForm data of the form (mail adress)
   */
  async onSubmit(ngForm: NgForm) {
    console.log(await this.firebase.findUserWithEmail(this.mail));
    if (await this.firebase.findUserWithEmail(this.mail)) {
      if (ngForm.valid && ngForm.submitted) {
        this.displayMailsentFeedback();
        this.sentMail(ngForm);
        this.resetMailsentFeedback();
      }
    } else {
      this.displayWrongMailError();
      this.resetDisplayWrongMailError();
    }
  }

   /**
   * This function sets the variable of the "mailsent"-Feedback to true, sothat the feedback will be displayed
   */
  displayMailsentFeedback() {
    this.mailSent = true;
  }

  /**
   * This function resets the variable which displays the "mail sent" Feedback
   */
  resetMailsentFeedback() {
    setTimeout(() => {
      this.mailSent = false;
    }, 2000);
  }

  /**
   * This function sets the variable of the "wrong Email"-Error to true, sothat the error will be displayed
   */
  displayWrongMailError() {
    this.wrongMail = true;
  }

  /**
   * This function resets the variable which displays the "wrong Email" Error
   */
  resetDisplayWrongMailError() {
    setTimeout(() => {
      this.wrongMail = false;
    }, 2000);
  }

  sentMail(ngForm: any) {
    if (ngForm.submitted && ngForm.form.valid && !this.mailTest) {
      this.http.post(this.post.endPoint, this.post.body(this.data))
        .subscribe({
          next: (response) => {
            ngForm.resetForm();
          },
          error: (error: any) => {
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
