import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, addDoc, DocumentReference, arrayUnion, where } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { MainServiceService } from './main-service.service';

@Injectable({
  providedIn: 'root'
})
export class ChatServiceService {
  uid: string = 'tsvZAtPmhQsbvuAp6mi6';
  private threadData: { channelId: string, messageId: string, senderId: string } | null = null;
  senderId: string = '';

  constructor(private firestore: Firestore, private mainService: MainServiceService) { }

  setThreadData(threadInfo: { channelId: string, messageId: string, senderId: string }) {
    this.threadData = threadInfo;
  }

  getThreadData() {
    return this.threadData;
  }

  formatTime(timeString: string): string {
    const date = new Date(timeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return 'heute';
    }
    return date.toLocaleDateString('de-DE'); // Format: "TT.MM.JJJJ"
  }



  // Funktion zum Laden der Nachricht anhand der messageId
  async loadMessageData(channelId: string, messageId: string): Promise<any> {
    const messageDocRef = doc(this.firestore, `channels/${channelId}/messages`, messageId);
    const messageSnapshot = await getDoc(messageDocRef);

    if (messageSnapshot.exists()) {
      const messageData = messageSnapshot.data();
      return {
        content: messageData?.['content'],
        senderId: messageData?.['senderId'],
        time: messageData?.['time'],
        name: messageData?.['name']
      };
    } else {
      throw new Error('Nachricht nicht gefunden');
    }
  }

  async loadMessageDataFromFirestore(channelId: string, messageId: string): Promise<any> {
    const messageData = await this.loadMessageData(channelId, messageId);
    return { channelId, messageId, ...messageData };
  }

  async checkIfThreadExists(channelId: string, messageId: string, senderId: string): Promise<boolean> {
    const threadsCollectionRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads`);
    const querySnapshot = await getDocs(query(threadsCollectionRef, where(this.senderId, '==', senderId)));

    return !querySnapshot.empty;
  }

  async addNewThread(channelId: string, messageId: string, messageData: any): Promise<void> {
    const threadsCollectionRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads`);
    const threadDocRef = await addDoc(threadsCollectionRef, {
      content: messageData.content,
      senderId: messageData.senderId,
      time: messageData.time,
      name: messageData.name,
      createdAt: new Date() // Optional: Zeitstempel des Threads
    });
    console.log('Thread erfolgreich hinzugefügt mit ID:', threadDocRef.id);
  }

  async openExistingThread(channelId: string, messageId: string): Promise<void> {
    try {
      // Nachrichtendaten laden
      const messageData = await this.loadMessageData(channelId, messageId);
      const senderId = messageData.senderId; // Sender ID aus den Nachrichtendaten

      const threadsCollectionRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads`);
      const querySnapshot = await getDocs(query(threadsCollectionRef, where(this.senderId, '==', senderId)));

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const threadData = doc.data();
          console.log('Thread gefunden:', threadData);

          // Hier kannst du den Thread-Daten anzeigen, z.B. in einem UI-Bereich
        });
      } else {
        console.log('Kein Thread gefunden.');
      }
    } catch (error) {
      console.error('Fehler beim Öffnen des vorhandenen Threads:', error);
    }
  }


  async setThreadDataFromMessage(channelId: string, messageId: string): Promise<void> {
    try {
      // Nachrichtendaten laden
      const messageData = await this.loadMessageDataFromFirestore(channelId, messageId);
      this.senderId = messageData.senderId;

      // Überprüfen, ob der Benutzer bereits einen Thread erstellt hat
      const threadExists = await this.checkIfThreadExists(channelId, messageId, messageData.senderId);

      if (threadExists) {
        // Thread existiert, öffne den bestehenden Thread
        console.log('Ein Thread von diesem Benutzer existiert bereits. Öffne den Thread.');
        this.openExistingThread(channelId, messageId);
      } else {
        // Thread existiert nicht, neuen Thread erstellen
        await this.addNewThread(channelId, messageId, messageData);
      }
    } catch (error) {
      console.error('Fehler beim Laden und Speichern der Nachricht:', error);
    }
  }



  /**
   * Lädt die Nachrichten aus der angegebenen Channel-ID.
   * @param channelId - ID des Channels, aus dem die Nachrichten geladen werden sollen.
   */
  loadMessages(channelId: string): Observable<any[]> {
    const messagesCollectionRef = collection(this.firestore, `channels/${channelId}/messages`);
    return new Observable((observer) => {
      onSnapshot(messagesCollectionRef, (snapshot) => {
        const messages = snapshot.docs.map(doc => {
          const messageData = doc.data();
          return {
            id: doc.id,
            ...messageData,
            isOwnMessage: messageData['senderId'] === this.uid
          };
        });
        observer.next(messages);
      }, (error) => observer.error(error));
    });
  }

  /**
   * Fügt eine neue Nachricht hinzu.
   * @param channelId - Channel-ID, in die die Nachricht eingefügt werden soll.
   * @param messageData - Daten der Nachricht.
   */
  addMessage(channelId: string, messageData: any): Promise<DocumentReference<any>> {
    const messagesCollectionRef = collection(this.firestore, `channels/${channelId}/messages`);
    return addDoc(messagesCollectionRef, messageData);
  }

  /**
   * Aktualisiert eine bestehende Nachricht.
   * @param messageId - ID der Nachricht.
   * @param updatedData - Die aktualisierten Daten der Nachricht.
   */
  updateMessage(messageId: string, updatedData: any): Observable<void> {
    return new Observable((observer) => {
      this.getActiveChannel().subscribe({
        next: (channel: any) => {
          const messageDocRef = doc(this.firestore, `channels/${channel.id}/messages`, messageId);
          updateDoc(messageDocRef, updatedData)
            .then(() => observer.next())
            .catch(error => observer.error('Fehler beim Aktualisieren der Nachricht: ' + error));
        },
        error: (error) => observer.error('Fehler beim Abrufen des aktiven Channels: ' + error)
      });
    });
  }

  /**
   * Lädt die aktive Channel-ID.
   */
  getActiveChannel(): Observable<any> {
    const channelsCollectionRef = this.mainService.getChannelRef('channels');
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

  /**
   * Fügt eine Reaktion zu einer Nachricht hinzu.
   * @param channelId - Channel-ID.
   * @param messageId - Nachrichten-ID.
   * @param reactionType - Typ der Reaktion.
   * @param userId - Benutzer-ID.
   * @param reactionPath - Pfad der Reaktion.
   */
  async addReactionToMessage(channelId: string, messageId: string, reactionType: string, userId: string, reactionPath: string): Promise<void> {
    const messageDocRef = this.mainService.getSingleChannelRef(`channels/${channelId}/messages`, messageId);
    const snapshot = await getDoc(messageDocRef);
    const messageData = snapshot.data();
    const reactions = messageData?.['reactions'] || [];

    const existingReactionIndex = reactions.findIndex((reaction: any) => reaction.type === reactionType && reaction.userId === userId);

    if (existingReactionIndex !== -1) {
      reactions[existingReactionIndex].count += 1;
    } else {
      reactions.push({
        type: reactionType,
        userId: userId,
        count: 1,
        path: reactionPath,
      });
    }

    await updateDoc(messageDocRef, { reactions: reactions });
  }

  /**
   * Lädt die Reaktionen.
   */
  async loadReactions(): Promise<any[]> {
    const reactionsRef = this.mainService.getChannelRef('reactions');
    const snapshot = await getDocs(reactionsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data()['name'],
      path: doc.data()['path']
    }));
  }
}

