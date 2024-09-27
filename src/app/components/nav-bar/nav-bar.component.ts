import { Component } from '@angular/core';
import { ProfileComponent } from '../../shared/profile/profile.component';
import { LogOutService } from '../../modules/log-out.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [ProfileComponent],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent {
  avatar = 'Elise_Roth.svg';
  open_logout!: boolean;
  constructor(private logOutService: LogOutService) {
    this.logOutService.open_logout$.subscribe(state => {
      this.open_logout = state;
    });
  }

  onOpenLogOut() {
    this.logOutService.updateProfile();
  }
}
