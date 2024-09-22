import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FooterComponent } from '../footer/footer.component';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { ChooseAvatarComponent } from '../choose-avatar/choose-avatar.component';
import { FormsModule, NgForm } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    FooterComponent,
    MatCardModule,
    MatIconModule,
    RouterModule,
    ChooseAvatarComponent,
    FormsModule,
    NgClass
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {

  data = {
    name: '',
    mail: '',
    password: '',
    acceptedPrivacyPolicy: false
  }

  name: string = '';
  mail: string = '';
  password: string = '';
  privacyPolicy: boolean = false;

  displayMailError: boolean = false;
  displayNameError: boolean = false;
  displayPasswordError: boolean = false;
  displayPrivatPolicyError: boolean = false;

  emptyInputs: boolean = true;

  constructor(private router: Router){

  }

  /**
   * This function activates the button if all inputs are filled and calls several control functions
   */
  checkPasswords(){
    if(this.name && this.mail && this.password && this.privacyPolicy){
      this.emptyInputs = false;                       
    }
    this.checkNameInput();
    this.checkMailInput();
    this.checkPasswordInput();
    this.checkPrivacyPolicyInput();
  }

  /**
   * This function checks if the name Input was already filled, if yes it displays an error-message
   */
  checkNameInput(){
    if(!this.name){
      this.displayNameError = true;
    } else{
      this.displayNameError = false;
    }
  }

   /**
   * This function checks if the mail Input was already filled, if yes it displays an error-message
   */
  checkMailInput(){
    if(!this.mail){
      this.displayMailError = true;
    }else{
      this.displayMailError = false;
    }
  }

   /**
   * This function checks if the password Input was already filled, if yes it displays an error-message
   */
  checkPasswordInput(){
    if(!this.password){
      this.displayPasswordError = true;
    }else{
      this.displayPasswordError = false;
    }
  }

   /**
   * This function checks if the Privacy Policy Checkbox was already marked, if yes it displays an error-message
   */
  checkPrivacyPolicyInput(){    
    if(!this.privacyPolicy){
      this.displayPrivatPolicyError = true;
    } else{
      this.displayPrivatPolicyError = false;
    }
  }

  /**
   * This function empties all Inputs
   */
  emptyAllInputs(){
    this.name = '';
    this.mail = '';
    this.password = '';
    this.privacyPolicy = false;
  }

  /**
   * This function submits the form, empties all inputs and send you back to the login page
   */
  onSubmit(){
    this.emptyAllInputs(); 
    this.router.navigate(['/']);
    console.log('SignIn works');
  }

}
