import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FooterComponent } from '../footer/footer.component';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { SignInComponent } from '../sign-in/sign-in.component';
import { NgFor } from '@angular/common';


@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [
    MatCardModule,
    FooterComponent,
    MatIconModule,
    RouterModule,
    SignInComponent,
    NgFor,
  ],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss'
})
export class ChooseAvatarComponent {

  constructor(private router: Router){

  }

  avatar:string[] = ["Elias_Neumann","Elise_Roth","Frederik_Beck","Noah_Braun","Sofia_Müller","Steffen_Hoffmann"];

  Userregistrated: boolean = true;

  registerCompleted(){
    this.Userregistrated = true;
    setTimeout(() => {
      this.Userregistrated = false;
      this.router.navigate(['/']);
    },2000);

  }
}
