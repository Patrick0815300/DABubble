import { Component, OnInit } from '@angular/core';
import { ProfileComponent } from '../../shared/profile/profile.component';
import { LogOutService } from '../../modules/log-out.service';
import { User } from '../../modules/database.model';
import { DatabaseServiceService } from '../../database-service.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [ProfileComponent],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent implements OnInit {
  avatar = 'Elise_Roth.svg';
  open_logout!: boolean;
  authenticatedUser: User | undefined;
  constructor(private logOutService: LogOutService, public databaseService: DatabaseServiceService) {
    this.logOutService.open_logout$.subscribe(state => {
      this.open_logout = state;
    });
  }

  ngOnInit(): void {
    this.databaseService.authenticatedUser().subscribe(user => {
      this.authenticatedUser = user;
    });
  }

  onOpenLogOut() {
    this.logOutService.updateProfile();
  }
}
