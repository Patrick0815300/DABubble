import { Injectable } from '@angular/core';
import { DocumentReference, Firestore, addDoc, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MainServiceService } from './main-service.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatareaServiceService {
  uid = this.authService.getUID();

  constructor(private firestore: Firestore, private mainService: MainServiceService, private authService: AuthService) { }

  /**
   * Loads a Firestore document and returns an observable with its data.
   * @param {string} collection - The Firestore collection name.
   * @param {string} docId - The ID of the document to load.
   * @returns {Observable<any>} An observable that emits the document data.
   */
  loadDocument(collection: string, docId: string): Observable<any> {
    const docRef = this.mainService.getSingleChannelRef(collection, docId);
    return new Observable((observer) => {
      onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          observer.next({ id: snapshot.id, ...data });
        }
      }, (error) => observer.error(error));
    });
  }

  /**
   * Gets the active channel (the channel with 'chosen' set to true).
   * @returns {Observable<any>} An observable that emits the active channel data.
   */
  getActiveChannel(): Observable<any> {
    const channelsCollectionRef = this.mainService.getChannelRef('channels');
    const q = query(channelsCollectionRef, where('chosen', '==', true));
    return new Observable((observer) => {
      onSnapshot(q, (snapshot) => {
        snapshot.forEach((doc) => {
          const channelData = { id: doc.id, ...doc.data() };
          observer.next(channelData);
        });
      }, (error) => observer.error(error));
    });
  }

  /**
   * Marks the active channel as inactive by setting 'chosen' to false.
   * @returns {Observable<void>} An observable that completes when the channel is updated.
   */
  leaveActiveChannel(): Observable<void> {
    const channelsCollectionRef = this.mainService.getChannelRef('channels');
    const q = query(channelsCollectionRef, where('chosen', '==', true));
    return new Observable((observer) => {
      onSnapshot(q, (snapshot) => {
        snapshot.forEach((doc) => {
          const channelDocRef = doc.ref;
          updateDoc(channelDocRef, { chosen: false })
            .then(() => observer.next())
        });
      }, (error) => observer.error(error));
    });
  }

  /**
   * Checks if all channels have 'chosen' set to false.
   * @returns {Observable<boolean>} An observable that emits true if all channels are inactive, otherwise false.
   */
  checkIfAllChannelsAreFalse(): Observable<boolean> {
    const channelsCollectionRef = collection(this.firestore, 'channels');
    return new Observable((observer) => {
      onSnapshot(channelsCollectionRef, (snapshot) => {
        let allFalse = true;
        snapshot.docs.forEach((doc) => {
          const channelData = doc.data();
          if (channelData['chosen'] === true) {
            allFalse = false;
          }
        });
        observer.next(allFalse);
      }, (error) => observer.error(error));
    });
  }

  /**
   * Updates a Firestore channel document with the provided data.
   * @param {string} channelId - The ID of the channel to update.
   * @param {any} updatedData - The data to update in the channel document.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  updateChannel(channelId: string, updatedData: any): Promise<void> {
    const channelDocRef = this.mainService.getSingleChannelRef('channels', channelId);
    return updateDoc(channelDocRef, updatedData);
  }

  /**
   * Loads all users from the 'users' collection.
   * @returns {Observable<any[]>} An observable that emits an array of user data.
   */
  loadAllUsers(): Observable<any[]> {
    const usersCollectionRef = this.mainService.getChannelRef('users');
    return new Observable((observer) => {
      onSnapshot(usersCollectionRef, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        observer.next(users);
      }, (error) => observer.error(error));
    });
  }

  /**
   * Adds a list of user IDs to the 'member' field of the active channel.
   * @param {string[]} userIds - The list of user IDs to add to the channel.
   * @returns {Observable<void>} An observable that completes when the users are added.
   */
  addMembersToActiveChannel(userIds: string[]): Observable<void> {
    return new Observable((observer) => {
      this.getActiveChannel().subscribe({
        next: (channel: any) => {
          const channelDocRef = this.mainService.getSingleChannelRef('channels', channel.id);
          updateDoc(channelDocRef, { member: arrayUnion(...userIds) })
            .then(() => observer.next())
            .catch((error) => observer.error(error));
        },
      });
    });
  }

  /**
   * Loads all messages from a specific channel.
   * @param {string} channelId - The ID of the channel to load messages from.
   * @returns {Observable<any[]>} An observable that emits an array of message data.
   */
  loadMessages(channelId: string): Observable<any[]> {
    const messagesCollectionRef = collection(this.firestore, `channels/${channelId}/messages`);
    return new Observable((observer) => {
      onSnapshot(messagesCollectionRef, (snapshot) => {
        const messages = snapshot.docs.map(doc => {
          const messageData = doc.data();
          return { id: doc.id, ...messageData, isOwnMessage: messageData['senderId'] === this.uid };
        });
        observer.next(messages);
      });
    });
  }

  /**
   * Adds a new message to a specific channel.
   * @param {string} channelId - The ID of the channel to add the message to.
   * @param {any} messageData - The message data to add.
   * @returns {Promise<DocumentReference<any>>} A promise that resolves with the reference to the new message.
   */
  addMessage(channelId: string, messageData: any): Promise<DocumentReference<any>> {
    const messagesCollectionRef = collection(this.firestore, `channels/${channelId}/messages`);
    return addDoc(messagesCollectionRef, messageData);
  }

  /**
   * Updates a specific message within the active channel.
   * @param {string} messageId - The ID of the message to update.
   * @param {any} updatedData - The data to update in the message document.
   * @returns {Observable<void>} An observable that completes when the message is updated.
   */
  updateMessage(messageId: string, updatedData: any): Observable<void> {
    return new Observable((observer) => {
      this.getActiveChannel().subscribe({
        next: (channel: any) => {
          const messageDocRef = doc(this.firestore, `channels/${channel.id}/messages`, messageId);
          updateDoc(messageDocRef, updatedData)
            .then(() => observer.next())
            .catch(error => observer.error('Error updating the message: ' + error));
        },
        error: (error) => observer.error('Error retrieving the active channel: ' + error)
      });
    });
  }

  /**
   * Adds a reaction to a specific message.
   * @param {string} channelId - The ID of the channel containing the message.
   * @param {string} messageId - The ID of the message to add the reaction to.
   * @param {string} reactionType - The type of the reaction.
   * @param {string} userId - The ID of the user adding the reaction.
   * @param {string} reactionPath - The path to the reaction image.
   * @returns {Promise<void>} A promise that resolves when the reaction is added.
   */
  async addReactionToMessage(channelId: string, messageId: string, reactionType: string, userId: string, reactionPath: string): Promise<void> {
    const messageDocRef = this.mainService.getSingleChannelRef(`channels/${channelId}/messages`, messageId);
    const messageData = (await getDoc(messageDocRef)).data();
    const reactions = messageData?.['reactions'] || [];
    const existingReaction = reactions.find((reaction: any) => reaction.type === reactionType && reaction.userId === userId);
    if (existingReaction) {
      existingReaction.count += 1;
    } else {
      reactions.push({ type: reactionType, userId, count: 1, path: reactionPath });
    }
    await updateDoc(messageDocRef, { reactions });
  }

  /**
   * Loads all available reactions from the 'reactions' collection.
   * @returns {Promise<any[]>} A promise that resolves with an array of reaction data.
   */
  async loadReactions(): Promise<any[]> {
    const reactionsRef = this.mainService.getChannelRef('reactions');
    const snapshot = await getDocs(reactionsRef);
    const reactions = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data()['name'],
      path: doc.data()['path']
    }));
    return reactions;
  }
}