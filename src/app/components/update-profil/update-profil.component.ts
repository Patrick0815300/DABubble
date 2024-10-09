import { Component, OnInit } from '@angular/core';
import { ShowProfilService } from '../../modules/show-profil.service';
import { UpdateProfilService } from '../../modules/update-profil.service';
import { DatabaseServiceService } from '../../database-service.service';
import { User } from '../../modules/database.model';
import { FormsModule } from '@angular/forms';
import { doc, Firestore, updateDoc, collection } from '@angular/fire/firestore';

@Component({
  selector: 'app-update-profil',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './update-profil.component.html',
  styleUrl: './update-profil.component.scss',
})
export class UpdateProfilComponent implements OnInit {
  open_show_profile_nav!: boolean;
  open_update_profil!: boolean;
  authenticatedUser: User | undefined;
  username: string = '';
  user_email: string | undefined = '';
  constructor(
    private firestore: Firestore,
    private showProfileService: ShowProfilService,
    private updateProfilService: UpdateProfilService,
    private databaseService: DatabaseServiceService
  ) {
    this.showProfileService.open_show_profile_nav$.subscribe(state => {
      this.open_show_profile_nav = state;
    });
    this.updateProfilService.open_update_profil$.subscribe(state => {
      this.open_update_profil = state;
    });
  }

  ngOnInit(): void {
    this.databaseService.authenticatedUser().subscribe(user => {
      this.authenticatedUser = user;
      this.username = this.authenticatedUser?.name;
      this.user_email = this.authenticatedUser?.email;
    });
  }

  onCloseUpdateProfile() {
    this.updateProfilService.updateProfile();
  }

  save(collectionName: string, userId: string) {
    this.databaseService.updateUserData(collectionName, userId, { email: this.user_email, name: this.username });
    this.updateProfilService.updateProfile();
    this.showProfileService.updateNavProfile();
  }
}
