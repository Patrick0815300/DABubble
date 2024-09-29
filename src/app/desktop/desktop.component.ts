import { Component } from '@angular/core';
import { FirebaseLoginService } from '../firebase_LogIn/firebase-login.service';
import { ActivatedRoute } from '@angular/router';
import { collection, doc } from 'firebase/firestore';
import { Firestore, getFirestore } from 'firebase/firestore';
import { inject } from '@angular/core';

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [
    
  ],
  templateUrl: './desktop.component.html',
  styleUrl: './desktop.component.scss'
})
export class DesktopComponent {

  userId: any = '';
  img:string = '';

  constructor(private firebase: FirebaseLoginService, private route: ActivatedRoute){
  }

}
