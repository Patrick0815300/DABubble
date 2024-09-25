import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';
import { FirebaseLoginService } from '../firebase_LogIn/firebase-login.service';
import { NgIf } from '@angular/common';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    RouterModule,
    FooterComponent,
    HeaderComponent,
    FormsModule,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  mail: string = '';
  password: string = '';
  displayWrongMailOrPasswordError: boolean = false;

  constructor(private firebase: FirebaseLoginService){

  }

  async test(){   
    if(await this.firebase.findUserWithEmail(this.mail)){

    } else {
      this.displayWrongMailOrPasswordErrorMessage();
    }
  }

  /**
   * This function resets all input-tags on the login-screen
   */
  resetInputs(){
    this.mail = '';
    this.password = '';
  }

  /**
   * This function changes the value for displayWrongMailOrPasswordError-Variable from false to true for 2 seconds, sothat an Error will be displayed for this time
   */
  displayWrongMailOrPasswordErrorMessage(){
    this.displayWrongMailOrPasswordError = true;
    setTimeout(()=>{
      this.displayWrongMailOrPasswordError = false;
    }, 2000);
  }

}
