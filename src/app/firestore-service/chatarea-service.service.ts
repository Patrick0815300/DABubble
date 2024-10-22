import { Injectable } from '@angular/core';
import { DocumentReference, Firestore, addDoc, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { Observable, Subscription, catchError, filter, map, of, switchMap } from 'rxjs';
import { MainServiceService } from './main-service.service';
import { AuthService } from './auth.service';
import { CollectionReference, arrayRemove, deleteDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatareaServiceService {
  uid: string | null = null;
  private uidSubscription: Subscription | null = null;

  constructor(private firestore: Firestore, private mainService: MainServiceService, private authService: AuthService) {
    this.uidSubscription = this.authService.getUIDObservable().subscribe((uid: string | null) => {
      this.uid = uid;
    });

  }

  ngOnDestroy() {
    if (this.uidSubscription) {
      this.uidSubscription.unsubscribe();
    }
  }

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

  getUserAvatar(docId: string): Observable<string | null> {
    return this.loadDocument('users', docId).pipe(
      map((user) => user.avatar ? user.avatar : null)
    );
  }

  getActiveChannel(): Observable<any> {
    return this.authService.getUIDObservable().pipe(
      filter(uid => !!uid),
      switchMap(uid => new Observable(observer => {
        const userDoc = doc(this.firestore, `users/${uid}`);
        const unsubUser = onSnapshot(userDoc, userSnap => {
          const channelId = userSnap.data()?.['activeChannelId'];
          if (channelId) {
            const channelDoc = doc(this.firestore, `channels/${channelId}`);
            const unsubChannel = onSnapshot(channelDoc, channelSnap => {
              observer.next(channelSnap.exists() ? { id: channelSnap.id, ...channelSnap.data() } : null);
            }, error => { console.error(error); observer.next(null); });
            observer.add(unsubChannel);
          } else {
            observer.next(null);
          }
        }, error => { console.error(error); observer.next(null); });
        return () => unsubUser();
      })),
      catchError(error => { console.error(error); return of(null); })
    );
  }

  private subscribeToChannel(channelId: string, observer: any): () => void {
    return onSnapshot(doc(this.firestore, `channels/${channelId}`), (channelSnap) => {
      if (channelSnap.exists()) {
        observer.next({ id: channelSnap.id, ...channelSnap.data() });
      } else {
        observer.error('Kanal nicht gefunden');
      }
    }, (error) => observer.error(error));
  }

  leaveActiveChannel(): Observable<void> {
    return new Observable((observer) => {
      (async () => {
        try {
          const userRef = doc(this.firestore, `users/${this.uid}`);
          const userSnap = await getDoc(userRef);
          const channelId = userSnap.data()?.['activeChannelId'];
          await updateDoc(userRef, { activeChannelId: '' });
          if (channelId) await updateDoc(doc(this.firestore, `channels/${channelId}`), { members: arrayRemove(this.uid) });
          observer.next();
        } catch (error) { observer.error(error); }
      })();
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

  async deleteMessageWithSubcollections(channelId: string, messageId: string): Promise<void> {
    // Hauptdokument löschen
    const messageDocRef = doc(this.firestore, `channels/${channelId}/messages/${messageId}`);
    await deleteDoc(messageDocRef);

    // Unterkollektion 'replies' löschen
    const repliesCollectionRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads`);
    const repliesSnapshot = await getDocs(repliesCollectionRef);
    const deletePromises = repliesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Weitere bekannte Unterkollektionen können hier hinzugefügt werden
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