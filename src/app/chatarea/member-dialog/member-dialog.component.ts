import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogRef, MatDialog, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../models/user/user.model';
import { ProfilMemberDialogComponent } from './profil-member-dialog/profil-member-dialog.component';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';
import { ChatareaServiceService } from '../../firestore-service/chatarea-service.service'; // Importiere den Service

@Component({
  selector: 'app-member-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatDialogActions,
    MatButtonModule,
  ],
  templateUrl: './member-dialog.component.html',
  styleUrl: './member-dialog.component.scss'
})
export class MemberDialogComponent {

  users: User[] = [];
  memberIds: string[] = [];
  channelName = 'Entwickler Team';

  constructor(
    public dialogRef: MatDialogRef<MemberDialogComponent>,
    public dialog: MatDialog,
    private chatareaService: ChatareaServiceService
  ) {
    this.loadChannelMembers();
  }

  loadChannelMembers() {
    this.chatareaService.getActiveChannel().subscribe((channel: any) => {
      this.memberIds = channel.member || [];
      this.loadUsers(); // Lade die zugehörigen Benutzerdaten
    });
  }

  loadUsers() {
    this.users = [];
    this.memberIds.forEach((memberId) => {
      this.chatareaService.loadDocument('users', memberId).subscribe((user: any) => {
        const userInstance = new User({ ...user });
        this.users.push(userInstance);
      });
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  openProfilDialog() {
    this.dialog.closeAll();
    this.dialog.open(ProfilMemberDialogComponent);
  }

  openAddMemberDialog() {
    this.dialog.closeAll();
    this.dialog.open(AddMemberDialogComponent);
  }
}
