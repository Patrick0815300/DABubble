import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { ChannelDialogComponent } from './channel-dialog/channel-dialog.component';
import { MemberDialogComponent } from './member-dialog/member-dialog.component';
import { AddMemberDialogComponent } from './add-member-dialog/add-member-dialog.component';
import { MessageComponent } from "./message/message.component";
import { OwnMessageComponent } from "./own-message/own-message.component";
import { MessageBoxComponent } from "./message-box/message-box.component";
import { Firestore, collection, doc, onSnapshot, query, where } from '@angular/fire/firestore';
import { User } from '../models/user/user.model';

@Component({
  selector: 'app-chatarea',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    ChannelDialogComponent,
    MessageComponent,
    OwnMessageComponent,
    MessageBoxComponent
  ],
  templateUrl: './chatarea.component.html',
  styleUrl: './chatarea.component.scss'
})
export class ChatareaComponent {

  firestore: Firestore = inject(Firestore);
  channelName: string = '';
  memberIds: string[] = [];
  channelId: string = '';
  members: User[] = [];

  constructor(public dialog: MatDialog) {
    this.loadChannelId();
  }


  loadChannelId() {
    const channelsCollectionRef = collection(this.firestore, 'channel'); // Referenz auf die Channels-Sammlung
    const q = query(channelsCollectionRef, where('name', '==', 'Entwickler Team')); // Query nach Channel-Name

    onSnapshot(q, (snapshot) => {
      snapshot.forEach((doc) => {
        this.channelId = doc.id; // Setze die Channel-ID
        const channelData = doc.data();
        this.channelName = channelData['name'];
        this.memberIds = channelData['member'] || [];
        this.loadMembers();
      });
    }, (error) => {
      console.error('Fehler beim Abrufen der Channel-ID:', error);
    });
  }

  loadMembers() {
    this.members = []; // Leere das Mitglieder-Array
    this.memberIds.forEach((memberId) => {
      const userDocRef = doc(this.firestore, 'user', memberId);

      onSnapshot(userDocRef, (userSnapshot) => {
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const user = new User({ ...userData, id: userSnapshot.id }); // Erstelle eine User-Instanz
          this.members.push(user); // Füge das Mitglied zum Array hinzu
        } else {
          console.log(`Benutzer mit ID ${memberId} nicht gefunden.`);
        }
      }, (error) => {
        console.error(`Fehler beim Abrufen des Benutzers mit ID ${memberId}:`, error);
      });
    });
  }

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
