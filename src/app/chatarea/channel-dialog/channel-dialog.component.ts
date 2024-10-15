import { Component, EventEmitter, Output } from '@angular/core';
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
import { MemberDialogComponent } from "../member-dialog/member-dialog.component";

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
    MemberDialogComponent
  ],
  templateUrl: './channel-dialog.component.html',
  styleUrls: ['./channel-dialog.component.scss']
})
export class ChannelDialogComponent {
  @Output() toggleChannelInfoDialog = new EventEmitter<void>();
  admin: string = '';
  description: string = '';
  name: string = '';
  selectedChannelId: string = '';
  channels: Channel[] = [];
  channelNameEdit: boolean = false;
  channelDescEdit: boolean = false;
  channel: Channel = new Channel();

  constructor(private fireService: ChatareaServiceService) {
    this.loadActiveChannel();
  }

  loadActiveChannel() {
    this.fireService.getActiveChannel().subscribe({
      next: (channel: any) => {
        this.selectedChannelId = channel.channel_id;
        this.name = channel.channel_name;
        this.description = channel.description;
        this.admin = channel.admin;
      }
    });
  }

  async leaveChannel() {
    this.fireService.leaveActiveChannel().subscribe({
      next: () => {
        this.closeDialog();
      }
    });
  }

  editChannelName() {
    if (this.channelNameEdit) {
      this.saveChanges({ channel_name: this.name });
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
  }

  closeDialog() {
    this.toggleChannelInfoDialog.emit();
  }
}
