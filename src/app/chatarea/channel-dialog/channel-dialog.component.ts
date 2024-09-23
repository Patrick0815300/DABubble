import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatDialogRef,
  MatDialogActions,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Firestore, collection, doc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { MainServiceService } from '../../firestore-service/main-service.service';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../models/channels/entwickler-team.model';

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
  styleUrl: './channel-dialog.component.scss'
})
export class ChannelDialogComponent {

  firestore: Firestore = inject(Firestore);
  admin: string = '';
  description: string = '';
  name: string = ''; //name of the channel

  colId = 'channel';
  selectedChannelId = '';

  channels: Channel[] = [];

  channelNameEdit: boolean = false;
  channelDescEdit: boolean = false;

  unsubChannel;


  constructor(public dialogRef: MatDialogRef<ChannelDialogComponent>, private FireService: MainServiceService) {
    this.unsubChannel = this.subCollection(this.colId);
  }

  ngOnDestroy() {
    this.unsubChannel();
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
    if (this.selectedChannelId) {
      const docRef = doc(this.firestore, `${this.colId}/${this.selectedChannelId}`);
      updateDoc(docRef, updatedData)
        .then(() => {
          console.log('Änderungen erfolgreich gespeichert.');
        })
        .catch((error) => {
          console.error('Fehler beim Speichern der Änderungen:', error);
        });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  subCollection(colId: string) {
    const channelCollectionRef = collection(this.firestore, colId);

    return onSnapshot(channelCollectionRef, (snapshot) => {
      this.channels = []; // Leere das Array, um Duplikate zu vermeiden
      snapshot.forEach((doc) => {
        const channelData = doc.data();
        const channel = new Channel({ ...channelData, id: doc.id }); // Verwende die Channel-Klasse
        this.channels.push(channel); // Füge jeden Channel zum Array hinzu

        // Wenn "chosen" true ist, wird der Channel automatisch ausgewählt
        if (channel.chosen) {
          this.selectChannel(channel.id);
        }
      });
    });
  }

  selectChannel(channelId: string) {
    this.selectedChannelId = channelId;
    const selectedChannel = this.channels.find(channel => channel.id === channelId);

    if (selectedChannel) {
      this.name = selectedChannel.name || '';
      this.description = selectedChannel.description || '';
      this.admin = selectedChannel.admin || '';
    }
  }
}
