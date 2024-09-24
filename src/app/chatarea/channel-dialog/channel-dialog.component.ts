import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogRef, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../models/channels/entwickler-team.model';
import { ChatareaServiceService } from '../../firestore-service/chatarea-service.service';

@Component({
  selector: 'app-channel-dialog',
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
    FormsModule,
  ],
  templateUrl: './channel-dialog.component.html',
  styleUrls: ['./channel-dialog.component.scss']
})
export class ChannelDialogComponent {

  admin: string = '';
  description: string = '';
  name: string = ''; // Name des Channels
  selectedChannelId: string = '';
  channels: Channel[] = [];
  channelNameEdit: boolean = false;
  channelDescEdit: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ChannelDialogComponent>,
    private fireService: ChatareaServiceService
  ) {
    this.loadActiveChannel();
  }

  ngOnDestroy() {
    this.dialogRef.close();
  }

  loadActiveChannel() {
    this.fireService.getActiveChannel().subscribe({
      next: (channel: any) => {
        this.selectedChannelId = channel.id;
        this.name = channel.name;
        this.description = channel.description;
        this.admin = channel.admin;
      },
      error: (err) => {
        console.error('Fehler beim Laden des aktiven Channels:', err);
      }
    });
  }

  leaveChannel() {
    this.fireService.leaveActiveChannel().subscribe({
      next: () => {
        console.log('Channel erfolgreich verlassen.');
        this.closeDialog();
      },
      error: (err) => {
        console.error('Fehler beim Verlassen des Channels:', err);
      }
    });
  }

  editChannelName() {
    if (this.channelNameEdit) {
      this.saveChanges({ name: this.name });
    }
    this.channelNameEdit = !this.channelNameEdit;
  }

  editChannelDescription() {
    if (this.channelDescEdit) {
      this.saveChanges({ description: this.description });
    }
    this.channelDescEdit = !this.channelDescEdit;
  }

  saveChanges(updatedData: any) {
    this.fireService.updateChannel(this.selectedChannelId, updatedData)
      .then(() => {
        console.log('Änderungen erfolgreich gespeichert.');
      })
      .catch((error) => {
        console.error('Fehler beim Speichern der Änderungen:', error);
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
