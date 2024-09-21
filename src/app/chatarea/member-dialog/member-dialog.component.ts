import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatDialogRef,
  MatDialogActions,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProfilMemberDialogComponent } from './profil-member-dialog/profil-member-dialog.component';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';

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
  constructor(public dialogRef: MatDialogRef<MemberDialogComponent>, public dialog: MatDialog) { }

  closeDialog() {
    this.dialogRef.close();
  }

  openProfilDialog() {
    this.dialog.closeAll();
    this.dialog.open(ProfilMemberDialogComponent)
  }

  openAddMemberDialog() {
    this.dialog.closeAll();
    this.dialog.open(AddMemberDialogComponent)
  }
}
