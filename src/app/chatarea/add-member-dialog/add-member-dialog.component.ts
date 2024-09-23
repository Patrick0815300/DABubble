import { Component, inject } from '@angular/core';
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
import { Firestore, arrayUnion, collection, doc, getDocs, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { User } from '../../models/user/user.model';
import { MatSelectModule } from '@angular/material/select';
import { FilterSelectedPipe } from '../../pipes/filter-selected.pipe';

@Component({
  selector: 'app-add-member-dialog',
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
    MatSelectModule,
    FilterSelectedPipe
  ],
  templateUrl: './add-member-dialog.component.html',
  styleUrl: './add-member-dialog.component.scss'
})
export class AddMemberDialogComponent {
  firestore: Firestore = inject(Firestore);
  users: User[] = [];

  filteredUsers: User[] = []; // Gefilterte Benutzer (die nicht im 'member'-Array sind)
  selectedUser: string[] = [];
  memberIds: string[] = []; // IDs der Mitglieder des Channels


  constructor(public dialogRef: MatDialogRef<AddMemberDialogComponent>) {
    this.loadChannelMembers();
    this.loadUsers();
  }

  loadChannelMembers() {
    const channelsCollectionRef = collection(this.firestore, 'channel');

    // Query, um das Dokument zu finden, wo der Name 'Entwickler Team' ist
    const q = query(channelsCollectionRef, where('name', '==', 'Entwickler Team'));

    onSnapshot(q, (snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.exists()) {
          const channelData = doc.data();
          this.memberIds = channelData['member'] || []; // Lade vorhandene Mitglieder
          this.filterUsers(); // Filtere Benutzer basierend auf den Mitglieder-IDs
        }
      });
    });
  }

  loadUsers() {
    const usersCollectionRef = collection(this.firestore, 'user');

    onSnapshot(usersCollectionRef, (snapshot) => {
      this.users = []; // Leere das Array, um Duplikate zu vermeiden
      snapshot.forEach((doc) => {
        const userData = doc.data();
        const user = new User({ ...userData, id: doc.id }); // Erstelle eine User-Instanz
        this.users.push(user); // Füge den Benutzer zum Array hinzu
      });

      this.filterUsers(); // Filtere die Benutzer nach dem Laden
    });
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => user.id && !this.memberIds.includes(user.id));
  }

  onUserSelected(selectedUserIds: string[]) {
    this.selectedUser = selectedUserIds;
    console.log('Ausgewählte Benutzer: ', this.selectedUser);
  }

  addUser() {
    const channelsCollectionRef = collection(this.firestore, 'channel');

    // Query, um das Dokument zu finden, wo der Name 'Entwickler Team' ist
    const q = query(channelsCollectionRef, where('name', '==', 'Entwickler Team'));

    // Einmalige Abfrage mit getDocs()
    getDocs(q).then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.exists()) {
          const channelDocRef = doc.ref;

          // Füge die Benutzer-ID zum 'member'-Array hinzu, falls noch nicht vorhanden
          updateDoc(channelDocRef, {
            member: arrayUnion(...this.selectedUser) // Füge die ausgewählte Benutzer-ID hinzu
          })
            .then(() => {
              console.log('Benutzer erfolgreich hinzugefügt.');
            })
            .catch((error) => {
              console.error('Fehler beim Hinzufügen der Benutzer: ', error);
            });
        } else {
          console.log('Channel mit dem Namen "Entwickler Team" nicht gefunden.');
        }
      });
    }).catch((error) => {
      console.error('Fehler beim Abrufen des Channels: ', error);
    });
  }




  closeDialog() {
    this.dialogRef.close();
  }
}
