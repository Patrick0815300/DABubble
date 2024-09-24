import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavService {
  private stateSubject = new BehaviorSubject<boolean>(false);
  constructor() {}
  state$ = this.stateSubject.asObservable();
  isDialogOpen = false;

  createChannel() {
    this.isDialogOpen = !this.isDialogOpen;
    this.stateSubject.next(this.isDialogOpen);
  }
}
