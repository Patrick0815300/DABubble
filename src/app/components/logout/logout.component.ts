import { Component, OnInit } from '@angular/core';
import { ShowProfilService } from '../../modules/show-profil.service';
import { UserService } from '../../modules/user.service';
import { DatabaseServiceService } from '../../database-service.service';
import { User } from '../../modules/database.model';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
})
export class LogoutComponent implements OnInit {
  open_show_profile_nav!: boolean;
  authenticatedUser: User | undefined;
  selectedUser: User | undefined;

  constructor(private userService: UserService, private showProfileService: ShowProfilService, private databaseService: DatabaseServiceService) {
    this.showProfileService.open_show_profile_nav$.subscribe(state => {
      this.open_show_profile_nav = state;
    });
  }

  ngOnInit(): void {
    this.databaseService.authenticatedUser().subscribe(user => {
      this.authenticatedUser = user;
    });

    /**
     * subscribe to selectedUser$ for the selected user object
     */
    this.userService.selectedUser$.subscribe(selected_user => {
      this.selectedUser = selected_user;
    });
  }

  onOpenShowProfile() {
    this.showProfileService.updateNavProfile();
  }

  sendSelectedUser(user: User) {
    this.userService.emitSelectedUser(user);
  }
}
