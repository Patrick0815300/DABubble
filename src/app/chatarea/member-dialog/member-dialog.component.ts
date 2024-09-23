import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogRef, MatDialog, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Firestore, collection, doc, onSnapshot, query, where, getDocs, getDoc } from '@angular/fire/firestore';
import { User } from '../../models/user/user.model';
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

  firestore: Firestore = inject(Firestore);
  users: User[] = [];
  memberIds: string[] = [];
  channelName = 'Entwickler Team';

  constructor(public dialogRef: MatDialogRef<MemberDialogComponent>, public dialog: MatDialog) {
    this.loadChannelMembers();
  }

  loadChannelMembers() {
    const channelsCollectionRef = collection(this.firestore, 'channel');

    // Query, um das Dokument zu finden, wo der Name 'Entwickler Team' ist
    const q = query(channelsCollectionRef, where('name', '==', this.channelName));

    onSnapshot(q, (snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.exists()) {
          const channelData = doc.data();
          this.memberIds = channelData['member'] || [];
          this.loadUsers(); // Lade die zugehörigen Benutzerdaten
        }
      });
    });
  }

  loadUsers() {
    this.users = []; // Leere das Benutzerarray
    this.memberIds.forEach((memberId) => {
      const userDocRef = doc(this.firestore, 'user', memberId); // Korrekte Referenz zum Benutzer-Dokument

      getDoc(userDocRef).then((userSnapshot) => {
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const user = new User({ ...userData, id: userSnapshot.id }); // Erstelle eine Benutzerinstanz
          this.users.push(user); // Füge den Benutzer zum Array hinzu
        } else {
          console.log(`Benutzer mit ID ${memberId} nicht gefunden.`); // Debug: Benutzer-Dokument nicht vorhanden
        }
      }).catch((error) => {
        console.error(`Fehler beim Abrufen des Benutzers mit ID ${memberId}:`, error); // Debug: Fehler bei der Abfrage des Benutzers
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
