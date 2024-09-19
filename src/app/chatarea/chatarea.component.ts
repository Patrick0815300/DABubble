import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ChannelDialogComponent } from './channel-dialog/channel-dialog.component';
import { MemberDialogComponent } from './member-dialog/member-dialog.component';
import { AddMemberDialogComponent } from './add-member-dialog/add-member-dialog.component';

@Component({
  selector: 'app-chatarea',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    ChannelDialogComponent
  ],
  templateUrl: './chatarea.component.html',
  styleUrl: './chatarea.component.scss'
})
export class ChatareaComponent {
  constructor(public dialog: MatDialog) { }

  openChannelDialog() {
    this.dialog.open(ChannelDialogComponent)
  }

  openMemberDialog() {
    this.dialog.open(MemberDialogComponent)
  }

  openAddMemberDialog() {
    this.dialog.open(AddMemberDialogComponent)
  }
}
