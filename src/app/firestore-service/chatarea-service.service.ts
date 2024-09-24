import { Injectable } from '@angular/core';
import { DocumentReference, Firestore, addDoc, arrayUnion, collection, doc, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MainServiceService } from './main-service.service';

@Injectable({
  providedIn: 'root'
})
export class ChatareaServiceService {

  constructor(private firestore: Firestore, private mainService: MainServiceService) { }

  loadDocument(collection: string, docId: string): Observable<any> {
    const docRef = this.mainService.getSingleChannelRef(collection, docId);
    return new Observable((observer) => {
      onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          observer.next({
            id: snapshot.id,
            ...data
          });
        } else {
          observer.error(`${collection} Dokument nicht gefunden.`);
        }
      }, (error) => observer.error(error));
    });
  }

  getActiveChannel(): Observable<any> {
    const channelsCollectionRef = this.mainService.getChannelRef('channel');
    const q = query(channelsCollectionRef, where('chosen', '==', true));
    return new Observable((observer) => {
      onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          snapshot.forEach((doc) => {
            observer.next({ id: doc.id, ...doc.data() });
          });
        } else {
          observer.error('Kein aktiver Channel gefunden.');
        }
      }, (error) => observer.error(error));
    });
  }

  leaveActiveChannel(): Observable<void> {
    const channelsCollectionRef = this.mainService.getChannelRef('channel');
    const q = query(channelsCollectionRef, where('chosen', '==', true));

    return new Observable((observer) => {
      onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          observer.error('Kein aktiver Channel gefunden.');
        } else {
          snapshot.forEach((doc) => {
            const channelDocRef = doc.ref;
            updateDoc(channelDocRef, { chosen: false })
              .then(() => {
                observer.next();
              })
              .catch((error) => {
                observer.error('Fehler beim Verlassen des Channels: ' + error);
              });
          });
        }
      }, (error) => observer.error(error));
    });
  }

  updateChannel(channelId: string, updatedData: any): Promise<void> {
    const channelDocRef = this.mainService.getSingleChannelRef('channel', channelId);
    return updateDoc(channelDocRef, updatedData);
  }

  loadAllUsers(): Observable<any[]> {
    const usersCollectionRef = this.mainService.getChannelRef('user');
    return new Observable((observer) => {
      onSnapshot(usersCollectionRef, (snapshot) => {
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        observer.next(users);
      }, (error) => observer.error(error));
    });
  }

  addMembersToActiveChannel(userIds: string[]): Observable<void> {
    return new Observable((observer) => {
      this.getActiveChannel().subscribe({
        next: (channel: any) => {
          const channelDocRef = this.mainService.getSingleChannelRef('channel', channel.id);
          updateDoc(channelDocRef, { member: arrayUnion(...userIds) })
            .then(() => observer.next())
            .catch((error) => observer.error(error));
        },
        error: (error) => observer.error(error)
      });
    });
  }

  loadMessages(channelId: string): Observable<any[]> {
    const messagesCollectionRef = collection(this.firestore, `channel/${channelId}/messages`); // Korrekte Referenz zu den Nachrichten
    return new Observable((observer) => {
      onSnapshot(messagesCollectionRef, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        observer.next(messages);
      }, (error) => observer.error(error));
    });
  }

  addMessage(channelId: string, messageData: any): Promise<DocumentReference<any>> {
    const messagesCollectionRef = collection(this.firestore, `channel/${channelId}/messages`);
    return addDoc(messagesCollectionRef, messageData);
  }

}