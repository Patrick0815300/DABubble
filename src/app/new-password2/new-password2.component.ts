import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NgClass } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-new-password2',
  standalone: true,
  imports: [
    FooterComponent,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    RouterModule,
    NgClass,
    FormsModule
  ],
  templateUrl: './new-password2.component.html',
  styleUrl: './new-password2.component.scss'
})
export class NewPassword2Component {

  Password1: string = '';
  Password2: string = '';

  passwordAccordance: boolean = false;
  emptyInputs: boolean = true;
  displayError: boolean = false;
  passwordChanged: boolean = false;

constructor(private router: Router){

}

  /**
   * This function clears the inputs and changes the Passwords
   */
  changePassword() {
    if(this.passwordAccordance){
      this.displayError = false;
      this.clearInputs();
      this.passwordChanged = true;
      setTimeout(()=>{
        this.passwordChanged = false;
        this.router.navigate(['/']);
      },2000);
    } else{
      this.displayError = true;
    }
  }

  /**
   * This function clears the inputs
   */
  clearInputs(){
    this.Password1 = '';
    this.Password2 = '';
  }

  /**
   * This function calls different Password-control functions
   */
  checkPasswords() {
    this.checkForEmptyInputs();
    this.checkForSamePasswords();
  }

  /**
   * This function checks if the PW1 and PW2 are the same or not
   */
  checkForSamePasswords(){
    this.displayError = false;
    if(this.Password1 === this.Password2){
      this.passwordAccordance = true;
    }
  }

  /**
   * This function checks, if the Inputs for Password 1 and 2 are empty or not
   */
  checkForEmptyInputs(){
    if(!this.Password1 || !this.Password2){
      this.emptyInputs = true;
    }else{
      this.emptyInputs = false;
    }
  }
}


