import { Component, Input, OnInit } from '@angular/core';
import { ShowProfilService } from '../../modules/show-profil.service';
import { UpdateProfilService } from '../../modules/update-profil.service';
import { User } from '../../modules/database.model';
import { DatabaseServiceService } from '../../database-service.service';
import { UserService } from '../../modules/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-profil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-profil.component.html',
  styleUrl: './show-profil.component.scss',
})
export class ShowProfilComponent implements OnInit {
  open_show_profile!: boolean;
  open_show_profile_nav!: boolean;
  open_update_profile!: boolean;
  authenticatedUser: User | undefined;
  selectedUser: User = new User();
  @Input() isNavBar: boolean = false;
  constructor(
    private userService: UserService,
    private showProfileService: ShowProfilService,
    private updateProfilService: UpdateProfilService,
    private databaseService: DatabaseServiceService
  ) {
    this.showProfileService.open_show_profile$.subscribe(state => {
      this.open_show_profile = state;
    });

    this.showProfileService.open_show_profile_nav$.subscribe(state => {
      this.open_show_profile_nav = state;
    });

    this.updateProfilService.open_update_profil$.subscribe(state => {
      this.open_update_profile = state;
    });

    /**
     * subscribe to selectedUser$ for the selected user object
     */
  }

  ngOnInit(): void {
    this.databaseService.authenticatedUser().subscribe(user => {
      this.authenticatedUser = user;
    });
    this.userService.selectedUser$.subscribe(selected_user => {
      this.selectedUser = selected_user;
    });
  }

  onCloseShowProfil() {
    if (this.open_show_profile) {
      this.showProfileService.updateProfile();
    }
    if (this.open_show_profile_nav) {
      this.showProfileService.updateNavProfile();
    }
  }

  onOpenUpdateProfil() {
    if (this.open_show_profile_nav) {
      this.showProfileService.updateNavProfile();
    }
    this.updateProfilService.updateProfile();
  }
}
