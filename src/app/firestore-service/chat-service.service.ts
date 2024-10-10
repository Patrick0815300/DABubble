import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, addDoc, DocumentReference, where } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { MainServiceService } from './main-service.service';
import { Message } from '../models/messages/channel-message.model';
import { Channel } from '../models/channels/entwickler-team.model';

@Injectable({
  providedIn: 'root'
})
export class ChatServiceService {
  uid: string = 'cYNWHsbhyTZwZHCZnGD3ujgD2Db2';
  private threadData: { channelId: string, messageId: string, senderId: string } | null = null;
  senderId: string = '';

  private pickedThreadSubject = new BehaviorSubject<any>(null);
  pickedThread$: Observable<any> = this.pickedThreadSubject.asObservable();

  private currentChannelSubject = new BehaviorSubject<Channel | null>(null);
  currentChannel$: Observable<Channel | null> = this.currentChannelSubject.asObservable();

  constructor(private firestore: Firestore, private mainService: MainServiceService) { }

  setThreadData(threadInfo: { channelId: string, messageId: string, senderId: string }) {
    this.threadData = threadInfo;
  }

  getThreadData() {
    return this.threadData;
  }

  setCurrentChannel(channel: Channel) {
    this.currentChannelSubject.next(channel);
  }

  async loadThreadMessages(channelId: string, messageId: string, threadId: string): Promise<any[]> {
    const messagesCollectionRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads/${threadId}/messages`);
    const snapshot = await getDocs(messagesCollectionRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async addReactionToThreadMessage(
    channelId: string,
    messageId: string,
    threadId: string,
    reactionType: string,
    reactionPath: string,
    messageIdThread: string
  ): Promise<void> {
    const messageDocRef = doc(this.firestore, `channels/${channelId}/messages/${messageId}/threads/${threadId}/messages/${messageIdThread}`);
    const snapshot = await getDoc(messageDocRef);
    const messageData = snapshot.data();
    const reactions = messageData?.['reactions'] || [];
    const hasReacted = await this.hasUserReacted(reactions, reactionType, this.uid);

    if (!hasReacted) {
      const updatedReactions = await this.addOrUpdateReaction(reactions, reactionType, this.uid, reactionPath);
      await updateDoc(messageDocRef, { reactions: updatedReactions });
    }
  }

  async getThreadDetails(
    channelId: string,
    messageId: string,
    callback: (count: number, lastMessageTime: string | null) => void
  ): Promise<void> {
    const threadsCollectionRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads`);

    onSnapshot(threadsCollectionRef, (threadsSnapshot) => {
      let totalMessagesCount = 0;
      let lastMessageTime: string | null = null;
      threadsSnapshot.docs.forEach((threadDoc) => {
        const threadId = threadDoc.id;
        const messagesCollectionRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads/${threadId}/messages`);

        onSnapshot(messagesCollectionRef, (messagesSnapshot) => {
          const threadMessages = messagesSnapshot.docs
            .map(doc => doc.data())
            .filter(message => message['content'] && message['time'])
            .sort((a, b) => new Date(a['time']).getTime() - new Date(b['time']).getTime());

          totalMessagesCount = threadMessages.length;
          if (threadMessages.length > 0) {
            const lastMessage = threadMessages[threadMessages.length - 1];
            if (!lastMessageTime || lastMessage['time'] > lastMessageTime) {
              lastMessageTime = lastMessage['time'];
            }
          }
          callback(totalMessagesCount, lastMessageTime);
        });
      });
    });
  }


  async updateChannelThreadState(channelId: string, isVisible: boolean): Promise<void> {
    const channelDocRef = doc(this.firestore, `channels/${channelId}`);
    await updateDoc(channelDocRef, { thread_open: isVisible });
  }

  async loadActiveChannel(): Promise<void> {
    this.getActiveChannel().subscribe({
      next: (channel) => {
        if (channel) {
          this.setCurrentChannel(channel);
        } else {
          console.error('Kein aktiver Channel ausgewählt.');
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden des aktiven Channels:', error);
      }
    });
  }

  async loadMessageData(channelId: string, messageId: string): Promise<any> {
    const messageDocRef = doc(this.firestore, `channels/${channelId}/messages`, messageId);
    const messageSnapshot = await getDoc(messageDocRef);
    if (messageSnapshot.exists()) {
      const messageData = messageSnapshot.data();
      return {
        content: messageData?.['content'],
        senderId: messageData?.['senderId'],
        time: messageData?.['time'],
        name: messageData?.['name'],
        reactions: messageData?.['reactions']
      };
    } else {
      throw new Error('Nachricht nicht gefunden');
    }
  }

  async loadMessageDataFromFirestore(channelId: string, messageId: string): Promise<any> {
    const messageData = await this.loadMessageData(channelId, messageId);
    return { channelId, messageId, ...messageData };
  }

  async addMessageToThread(channelId: string, messageId: string, threadId: string, message: Message): Promise<void> {
    const messagesCollectionRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads/${threadId}/messages`);
    const docRef = await addDoc(messagesCollectionRef, message.toJSON());
    await updateDoc(docRef, { id: docRef.id });
  }

  loadMessagesFromPath(path: string): Observable<any[]> {
    const messagesCollectionRef = collection(this.firestore, path);
    return new Observable((observer) => {
      onSnapshot(messagesCollectionRef, (snapshot) => {
        const messages = snapshot.docs
          .map(doc => doc.data())
          .filter(message => message['content'])
          .sort((a, b) => a['time'].localeCompare(b['time']));
        observer.next(messages);
      }, (error) => observer.error(error));
    });
  }

  async checkIfThreadExists(channelId: string, messageId: string, senderId: string): Promise<boolean> {
    const threadsCollectionRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads`);
    const querySnapshot = await getDocs(query(threadsCollectionRef, where('senderId', '==', senderId)));
    return !querySnapshot.empty;
  }

  async addNewThread(channelId: string, messageId: string, messageData: any): Promise<void> {
    const threadsCollectionRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads`);
    const threadDocRef = await addDoc(threadsCollectionRef, {
      content: messageData.content,
      senderId: messageData.senderId,
      time: messageData.time,
      name: messageData.name,
      reactions: messageData.reactions,
      createdAt: new Date(),
    });

    await updateDoc(threadDocRef, { threadId: threadDocRef.id });
    this.loadPickedThread(channelId, messageId, threadDocRef.id);
  }

  async getUserNameByUid(uid: string): Promise<string> {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        return userData?.['name'] || 'Unbekannt';
      } else {
        throw new Error('Benutzer nicht gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzernamens:', error);
      throw error;
    }
  }

  async loadPickedThread(channelId: string, messageId: string, threadId: string): Promise<any> {
    try {
      const threadDocRef = doc(this.firestore, `channels/${channelId}/messages/${messageId}/threads`, threadId);
      const threadSnapshot = await getDoc(threadDocRef);
      if (threadSnapshot.exists()) {
        const threadData = threadSnapshot.data();
        this.pickedThreadSubject.next({
          id: threadSnapshot.id,
          channelId: channelId,
          messageId: messageId,
          ...threadData,
        });
      } else {
        console.error('Thread nicht gefunden');
        return null;
      }
    } catch (error) {
      console.error('Fehler beim Laden des Threads:', error);
      throw error;
    }
  }

  async openExistingThread(channelId: string, messageId: string, threadId: string): Promise<void> {
    this.loadPickedThread(channelId, messageId, threadId);
  }

  async getExistingThreadId(channelId: string, messageId: string, senderId: string): Promise<string | null> {
    const threadsCollectionRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads`);
    const querySnapshot = await getDocs(query(threadsCollectionRef, where('senderId', '==', senderId)));
    if (!querySnapshot.empty) {
      const threadDoc = querySnapshot.docs[0];
      return threadDoc.id;
    } else {
      return null;
    }
  }

  async setThreadDataFromMessage(channelId: string, messageId: string): Promise<void> {
    try {
      const messageData = await this.loadMessageDataFromFirestore(channelId, messageId);
      const threadExists = await this.checkIfThreadExists(channelId, messageId, messageData.senderId);

      if (threadExists) {
        const existingThreadId = await this.getExistingThreadId(channelId, messageId, messageData.senderId);
        if (existingThreadId) {
          await this.openExistingThread(channelId, messageId, existingThreadId);
        } else {
          console.error('Thread-ID konnte nicht abgerufen werden.');
        }
      } else {
        await this.addNewThread(channelId, messageId, messageData);
      }

      await this.updateChannelThreadState(channelId, true);

      this.setThreadData(messageData);
    } catch (error) {
      console.error('Fehler beim Laden und Speichern der Nachricht:', error);
    }
  }

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

  async addReactionToMessage(channelId: string, messageId: string, reactionType: string, userId: string, reactionPath: string): Promise<void> {
    const messageDocRef = this.mainService.getSingleChannelRef(`channels/${channelId}/messages`, messageId);
    const snapshot = await getDoc(messageDocRef);
    const messageData = snapshot.data();
    const reactions = messageData?.['reactions'] || [];
    const hasReacted = await this.hasUserReacted(reactions, reactionType, userId);
    if (!hasReacted) {
      const updatedReactions = await this.addOrUpdateReaction(reactions, reactionType, userId, reactionPath);
      await updateDoc(messageDocRef, { reactions: updatedReactions });
    }
  }

  async hasUserReacted(reactions: any[], reactionType: string, userId: string): Promise<boolean> {
    return reactions.some(reaction => reaction.type === reactionType && reaction.userId === userId);
  }

  async addOrUpdateReaction(reactions: any[], reactionType: string, userId: string, reactionPath: string): Promise<any[]> {
    const existingReactionIndex = reactions.findIndex(reaction => reaction.type === reactionType && reaction.userId === userId);
    if (existingReactionIndex === -1) {
      reactions.push({
        type: reactionType,
        userId: userId,
        count: 1,
        path: reactionPath,
      });
    }
    return reactions;
  }

  async loadReactions(): Promise<any[]> {
    const reactionsRef = this.mainService.getChannelRef('reactions');
    const snapshot = await getDocs(reactionsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data()['name'],
      path: doc.data()['path']
    }));
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
}