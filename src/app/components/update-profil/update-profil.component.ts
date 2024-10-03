import { Component, OnInit } from '@angular/core';
import { ShowProfilService } from '../../modules/show-profil.service';
import { UpdateProfilService } from '../../modules/update-profil.service';
import { DatabaseServiceService } from '../../database-service.service';
import { User } from '../../modules/database.model';

@Component({
  selector: 'app-update-profil',
  standalone: true,
  imports: [],
  templateUrl: './update-profil.component.html',
  styleUrl: './update-profil.component.scss',
})
export class UpdateProfilComponent implements OnInit {
  open_show_profil!: boolean;
  open_update_profil!: boolean;
  authenticatedUser: User | undefined;
  constructor(private showProfileService: ShowProfilService, private updateProfilService: UpdateProfilService, private databaseService: DatabaseServiceService) {
    this.showProfileService.open_show_profile$.subscribe(state => {
      this.open_show_profil = state;
    });
    this.updateProfilService.open_update_profil$.subscribe(state => {
      this.open_update_profil = state;
    });
  }

  ngOnInit(): void {
    this.databaseService.authenticatedUser().subscribe(user => {
      this.authenticatedUser = user;
    });
  }

  onCloseUpdateProfile() {
    this.showProfileService.updateProfile();
    this.updateProfilService.updateProfile();
  }
}
