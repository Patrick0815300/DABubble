import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, addDoc, DocumentReference, where } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { MainServiceService } from './main-service.service';
import { Message } from '../models/messages/channel-message.model';
import { Channel } from '../models/channels/entwickler-team.model';
import { AuthService } from './auth.service';
import { arrayRemove, arrayUnion, limit, writeBatch } from 'firebase/firestore';
import { ChatareaServiceService } from './chatarea-service.service';

@Injectable({
  providedIn: 'root',
})
export class ChatServiceService implements OnInit, OnDestroy {
  uid: string | null = null;
  private uidSubscription: Subscription | null = null;
  senderId: string = '';
  private threadData: { channelId: string; messageId: string; senderId: string } | null = null;
  private pickedThreadSubject = new BehaviorSubject<any>(null);
  pickedThread$: Observable<any> = this.pickedThreadSubject.asObservable();
  private currentChannelSubject = new BehaviorSubject<Channel | null>(null);
  currentChannel$: Observable<Channel | null> = this.currentChannelSubject.asObservable();

  constructor(private firestore: Firestore, private mainService: MainServiceService, private authService: AuthService, private chatAreaService: ChatareaServiceService) {}

  ngOnInit() {
    this.uidSubscription = this.authService.getUIDObservable().subscribe((uid: string | null) => {
      this.uid = uid;
    });
  }

  ngOnDestroy() {
    if (this.uidSubscription) {
      this.uidSubscription.unsubscribe();
    }
  }

  async updateMessageFileUrl(channelId: string, messageId: string, threadId: string, docId: string, fileUrl: string, fileName: string): Promise<void> {
    const messageDocRef = doc(this.firestore, `channels/${channelId}/messages/${messageId}/threads/${threadId}/messages/${docId}`);
    await updateDoc(messageDocRef, {
      fileUrl: fileUrl,
      fileName: fileName,
    });
  }

  /**
   * Sets the thread data including channelId, messageId, and senderId.
   * @param {{channelId: string, messageId: string, senderId: string}} threadInfo - Information about the thread.
   */
  setThreadData(threadInfo: { channelId: string; messageId: string; senderId: string }) {
    this.threadData = threadInfo;
  }

  /**
   * Retrieves the current thread data.
   * @returns {any} The current thread data.
   */
  getThreadData() {
    return this.threadData;
  }

  /**
   * Sets the current channel and updates the currentChannelSubject observable.
   * @param {Channel} channel - The channel to set as current.
   */
  setCurrentChannel(channel: Channel) {
    this.currentChannelSubject.next(channel);
  }

  /**
   * Loads messages from a thread by channelId, messageId, and threadId.
   * @param {string} channelId - The ID of the channel.
   * @param {string} messageId - The ID of the message.
   * @param {string} threadId - The ID of the thread.
   * @returns {Promise<any[]>} A promise that resolves with an array of thread messages.
   */
  async loadThreadMessages(channelId: string, messageId: string, threadId: string): Promise<any[]> {
    const messagesCollectionRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads/${threadId}/messages`);
    const snapshot = await getDocs(messagesCollectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getReactionCount(channelId: string, messageId: string): Promise<number> {
    const messageRef = doc(this.firestore, `channels/${channelId}/messages/${messageId}`);
    try {
      const docSnap = await getDoc(messageRef);
      if (docSnap.exists()) {
        const reactions = docSnap.data()?.['reactions'] || [];
        let totalCount = 0;
        reactions.forEach((reaction: any) => {
          const userIds = reaction.userId || [];
          const userCount = userIds.length;
          totalCount = userCount;
        });
        return totalCount;
      } else {
        console.error('none Document exist');
        return 0;
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Reaktionsanzahl:', error);
      return 0;
    }
  }

  async updateReactionsInAllThreads(channelId: string, messageId: string, reactionType: string, uid: string, path: string, count: number): Promise<void> {
    const threadsSnapshot = await getDocs(collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads`)),
      batch = writeBatch(this.firestore),
      reaction = { type: reactionType, userId: [uid], path, count: count };
    threadsSnapshot.forEach(doc => {
      const reactions = doc.data()['reactions'] || [],
        hasReacted = reactions.some((r: any) => r.type === reactionType && r.uid === uid);
      batch.update(doc.ref, { reactions: hasReacted ? arrayRemove(reaction) : arrayUnion(reaction) });
    });
    await batch.commit();
  }

  async isThreadOpen(uid: string): Promise<boolean> {
    return (await getDoc(doc(this.firestore, `users/${uid}`))).data()?.['thread_open'];
  }

  threadOpenStatus(uid: string, callback: (isOpen: boolean) => void) {
    const userRef = doc(this.firestore, `users/${uid}`);
    return onSnapshot(userRef, doc => {
      const threadOpen = doc.data()?.['thread_open'] || false;
      callback(threadOpen);
    });
  }

  async hasThreads(channelId: string, messageId: string): Promise<boolean> {
    try {
      const threadsCollectionRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads`);
      const threadsQuery = query(threadsCollectionRef, limit(1));
      const snapshot = await getDocs(threadsQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('Fehler beim Überprüfen der Threads:', error);
      return false;
    }
  }

  /**
   * Adds a reaction to a thread message.
   * @param {string} channelId - The ID of the channel.
   * @param {string} messageId - The ID of the message.
   * @param {string} threadId - The ID of the thread.
   * @param {string} reactionType - The type of reaction to add.
   * @param {string} reactionPath - The path to the reaction image.
   * @param {string} messageIdThread - The ID of the message in the thread.
   * @returns {Promise<void>} A promise that resolves when the reaction is added.
   */
  async addReactionToThreadMessage(
    channelId: string,
    messageId: string,
    threadId: string,
    reactionType: string,
    reactionPath: string,
    messageIdThread: string,
    uid: string
  ): Promise<void> {
    const messageDocRef = doc(this.firestore, `channels/${channelId}/messages/${messageId}/threads/${threadId}/messages/${messageIdThread}`);
    const snapshot = await getDoc(messageDocRef);
    const messageData = snapshot.data();
    const reactions = messageData?.['reactions'] || [];
    const hasReacted = await this.hasUserReacted(reactions, reactionType, uid);
    if (!hasReacted) {
      const updatedReactions = await this.addOrUpdateReaction(reactions, reactionType, uid, reactionPath);
      await updateDoc(messageDocRef, { reactions: updatedReactions });
    }
  }

  /**
   * Fetches and updates the thread details including the total message count and the time of the last message.
   * @param {string} channelId - The ID of the channel.
   * @param {string} messageId - The ID of the message.
   * @param {(count: number, lastMessageTime: string | null) => void} callback - A callback to receive the total message count and the last message time.
   */
  async getThreadDetails(channelId: string, messageId: string, callback: (count: number, lastMessageTime: string | null) => void): Promise<void> {
    const threadsCollectionRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads`);
    onSnapshot(threadsCollectionRef, threadsSnapshot => {
      let totalMessagesCount = 0;
      let lastMessageTime: string | null = null;
      threadsSnapshot.docs.forEach(threadDoc => {
        const threadId = threadDoc.id;
        this.getThreadMessages(channelId, messageId, threadId, (count, time) => {
          totalMessagesCount = count;
          lastMessageTime = this.updateLastMessageTime(lastMessageTime, time);
          callback(totalMessagesCount, lastMessageTime);
        });
      });
    });
  }

  /**
   * Retrieves messages from a specific thread and passes them to a callback.
   * @param {string} channelId - The ID of the channel.
   * @param {string} messageId - The ID of the message.
   * @param {string} threadId - The ID of the thread.
   * @param {(count: number, lastMessageTime: string) => void} callback - A callback to receive the message count and the last message time.
   */
  getThreadMessages(channelId: string, messageId: string, threadId: string, callback: (count: number, lastMessageTime: string) => void): void {
    const messagesCollectionRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads/${threadId}/messages`);
    onSnapshot(messagesCollectionRef, messagesSnapshot => {
      const threadMessages = messagesSnapshot.docs
        .map(doc => doc.data())
        .filter(message => (message['content'] || message['fileUrl']) && message['time'])
        .sort((a, b) => new Date(a['time']).getTime() - new Date(b['time']).getTime());
      const count = threadMessages.length;
      const lastMessageTime = count > 0 ? threadMessages[count - 1]['time'] : null;
      callback(count, lastMessageTime);
    });
  }

  /**
   * Updates the last message time if the new time is more recent than the current time.
   * @param {string | null} currentTime - The current last message time.
   * @param {string | null} newTime - The new last message time.
   * @returns {string | null} The updated last message time.
   */
  updateLastMessageTime(currentTime: string | null, newTime: string | null): string | null {
    return !currentTime || (newTime && newTime > currentTime) ? newTime : currentTime;
  }

  /**
   * Updates the visibility state of a channel's thread.
   * @param {string} channelId - The ID of the channel.
   * @param {boolean} isVisible - Whether the thread should be visible or not.
   * @returns {Promise<void>} A promise that resolves when the channel's thread state is updated.
   */
  async updateChannelThreadState(uid: string, isVisible: boolean): Promise<void> {
    const channelDocRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(channelDocRef, { thread_open: isVisible });
  }

  /**s
   * Loads the currently active channel and sets it as the current channel.
   * @returns {Promise<void>} A promise that resolves when the active channel is loaded.
   */
  async loadActiveChannel(): Promise<void> {
    this.chatAreaService.getActiveChannel().subscribe({
      next: channel => {
        this.setCurrentChannel(channel);
      },
    });
  }

  /**
   * Loads data for a specific message within a channel.
   * @param {string} channelId - The ID of the channel.
   * @param {string} messageId - The ID of the message.
   * @returns {Promise<any>} A promise that resolves with the message data.
   */
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
        reactions: messageData?.['reactions'],
        fileUrl: messageData?.['fileUrl'],
        fileName: messageData?.['fileName'],
      };
    } else {
      throw new Error('Message not found');
    }
  }

  /**
   * Loads message data from Firestore, along with the channel and message IDs.
   * @param {string} channelId - The ID of the channel.
   * @param {string} messageId - The ID of the message.
   * @returns {Promise<any>} A promise that resolves with the message data, including channelId and messageId.
   */
  async loadMessageDataFromFirestore(channelId: string, messageId: string): Promise<any> {
    const messageData = await this.loadMessageData(channelId, messageId);
    return { channelId, messageId, ...messageData };
  }

  /**
   * Adds a message to a thread within a channel.
   * @param {string} channelId - The ID of the channel.
   * @param {string} messageId - The ID of the message.
   * @param {string} threadId - The ID of the thread.
   * @param {Message} message - The message to add to the thread.
   * @returns {Promise<void>} A promise that resolves when the message is added to the thread.
   */
  async addMessageToThread(channelId: string, messageId: string, threadId: string, message: Message): Promise<string> {
    const docRef = await addDoc(collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads/${threadId}/messages`), message.toJSON());
    await updateDoc(docRef, { id: docRef.id });
    message.id = docRef.id;
    return docRef.id;
  }

  /**
   * Loads messages from a specified path in Firestore.
   * @param {string} path - The Firestore path to load messages from.
   * @returns {Observable<any[]>} An observable that emits an array of messages from the specified path.
   */
  loadMessagesFromPath(path: string): Observable<any[]> {
    const messagesCollectionRef = collection(this.firestore, path);
    return new Observable(observer => {
      onSnapshot(
        messagesCollectionRef,
        snapshot => {
          const messages = snapshot.docs
            .map(doc => doc.data())
            .filter(message => message['content'] || message['fileUrl'])
            .sort((a, b) => a['time'].localeCompare(b['time']));
          observer.next(messages);
        },
        error => observer.error(error)
      );
    });
  }

  async getThreadIdIfExists(channelId: string, messageId: string, senderId: string): Promise<string | null> {
    const threadsQuery = query(collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads`), where('senderId', '==', senderId));
    const querySnapshot = await getDocs(threadsQuery);
    return querySnapshot.empty ? null : querySnapshot.docs[0].id;
  }

  /**
   * Adds a new thread for a specific message within a channel.
   * @param {string} channelId - The ID of the channel.
   * @param {string} messageId - The ID of the message.
   * @param {any} messageData - The data of the message to create the thread from.
   * @returns {Promise<void>} A promise that resolves when the new thread is added.
   */
  async addNewThread(channelId: string, messageId: string, messageData: any): Promise<void> {
    const threadsCollectionRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/threads`);
    const threadDocRef = await addDoc(threadsCollectionRef, {
      content: messageData.content,
      senderId: messageData.senderId,
      time: messageData.time,
      name: messageData.name,
      reactions: messageData.reactions,
      createdAt: new Date(),
      fileName: messageData.fileName,
      fileUrl: messageData.fileUrl,
    });
    await updateDoc(threadDocRef, { threadId: threadDocRef.id });
    this.loadPickedThread(channelId, messageId, threadDocRef.id);
  }

  /**
   * Retrieves the username based on the user's ID (UID).
   * @param {string} uid - The user ID (UID) to retrieve the name for.
   * @returns {Promise<string>} A promise that resolves with the user's name.
   */
  async getUserNameByUid(uid: string): Promise<string> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    const userSnapshot = await getDoc(userDocRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      return userData?.['name'] || 'Unknown';
    } else {
      throw new Error('User not found');
    }
  }

  /**
   * Loads the details of a specific thread by channelId, messageId, and threadId.
   * @param {string} channelId - The ID of the channel.
   * @param {string} messageId - The ID of the message.
   * @param {string} threadId - The ID of the thread to load.
   * @returns {Promise<any>} A promise that resolves with the thread data.
   */
  async loadPickedThread(channelId: string, messageId: string, threadId: string): Promise<any> {
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
    }
  }

  /**
   * Opens an existing thread by loading its details.
   * @param {string} channelId - The ID of the channel.
   * @param {string} messageId - The ID of the message.
   * @param {string} threadId - The ID of the thread to open.
   * @returns {Promise<void>} A promise that resolves when the thread is loaded.
   */
  async openExistingThread(channelId: string, messageId: string, threadId: string): Promise<void> {
    this.loadPickedThread(channelId, messageId, threadId);
  }

  /**
   * Sets the thread data for a message and updates the thread state.
   * @param {string} channelId - The ID of the channel.
   * @param {string} messageId - The ID of the message.
   * @returns {Promise<void>} A promise that resolves when the thread data is set.
   */
  async setThreadDataFromMessage(uid: string, channelId: string, messageId: string): Promise<void> {
    const messageData = await this.loadMessageDataFromFirestore(channelId, messageId);
    const threadExists = await this.getThreadIdIfExists(channelId, messageId, messageData.senderId);
    if (threadExists) {
      const existingThreadId = await this.getThreadIdIfExists(channelId, messageId, messageData.senderId);
      if (existingThreadId) {
        await this.openExistingThread(channelId, messageId, existingThreadId);
      }
    } else {
      await this.addNewThread(channelId, messageId, messageData);
    }
    await this.updateChannelThreadState(uid, true);
    this.setThreadData(messageData);
  }

  /**
   * Loads all messages from a specific channel.
   * @param {string} channelId - The ID of the channel.
   * @returns {Observable<any[]>} An observable that emits an array of messages from the channel.
   */
  loadMessages(channelId: string): Observable<any[]> {
    const messagesCollectionRef = collection(this.firestore, `channels/${channelId}/messages`);
    return new Observable(observer => {
      onSnapshot(
        messagesCollectionRef,
        snapshot => {
          const messages = snapshot.docs.map(doc => {
            const messageData = doc.data();
            return {
              id: doc.id,
              ...messageData,
              isOwnMessage: messageData['senderId'] === this.uid,
            };
          });
          observer.next(messages);
        },
        error => observer.error(error)
      );
    });
  }

  /**
   * Adds a new message to a specified channel in Firestore.
   * @param {string} channelId - The ID of the channel where the message will be added.
   * @param {any} messageData - The message data to be added to the channel.
   * @returns {Promise<DocumentReference<any>>} A promise that resolves with the reference of the newly added message.
   */
  addMessage(channelId: string, messageData: any): Promise<DocumentReference<any>> {
    const messagesCollectionRef = collection(this.firestore, `channels/${channelId}/messages`);
    return addDoc(messagesCollectionRef, messageData);
  }

  /**
   * Updates an existing message in a channel.
   * @param {string} messageId - The ID of the message to update.
   * @param {any} updatedData - The updated data to apply to the message.
   * @returns {Observable<void>} An observable that completes when the message is updated.
   */
  updateMessage(messageId: string, updatedData: any): Observable<void> {
    return new Observable(observer => {
      this.chatAreaService.getActiveChannel().subscribe({
        next: (channel: any) => {
          const messageDocRef = doc(this.firestore, `channels/${channel.id}/messages`, messageId);
          updateDoc(messageDocRef, updatedData).then(() => observer.next());
        },
      });
    });
  }

  /**
   * Loads all available reactions from the Firestore 'reactions' collection.
   * @returns {Promise<any[]>} A promise that resolves with an array of reaction objects.
   */
  async loadReactions(): Promise<any[]> {
    const reactionsRef = this.mainService.getChannelRef('reactions');
    const snapshot = await getDocs(reactionsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data()['name'],
      path: doc.data()['path'],
    }));
  }

  /**
   * Adds or updates a reaction for a message.
   * @param {any[]} reactions - The existing reactions array.
   * @param {string} reactionType - The type of reaction.
   * @param {string} userId - The ID of the user adding the reaction.
   * @param {string} reactionPath - The path to the reaction image or asset.
   * @returns {Promise<any[]>} A promise that resolves with the updated reactions array.
   */
  async addOrUpdateReaction(reactions: any[], reactionType: string, userId: string, reactionPath: string): Promise<any[]> {
    const existingReaction = reactions.find(reaction => reaction.type === reactionType);
    if (existingReaction) {
      if (!existingReaction.userId.includes(userId)) {
        existingReaction.userId.push(userId);
        existingReaction.count += 1;
      }
    } else {
      reactions.push({ type: reactionType, userId: [userId], count: 1, path: reactionPath });
    }
    return reactions;
  }

  /**
   * Adds or updates a reaction for a specific message in a channel.
   * @param {string} channelId - The ID of the channel.
   * @param {string} messageId - The ID of the message.
   * @param {string} reactionType - The type of reaction.
   * @param {string} userId - The ID of the user adding the reaction.
   * @param {string} reactionPath - The path to the reaction image or asset.
   * @returns {Promise<void>} A promise that resolves when the reaction is added or updated.
   */
  async addReactionToMessage(channelId: string, messageId: string, reactionType: string, userId: string, reactionPath: string): Promise<void> {
    const messageDocRef = this.mainService.getSingleChannelRef(`channels/${channelId}/messages`, messageId);
    const snapshot = await getDoc(messageDocRef);
    const messageData = snapshot.data();
    const reactions = messageData?.['reactions'] || [];
    const updatedReactions = await this.addOrUpdateReaction(reactions, reactionType, userId, reactionPath);
    await updateDoc(messageDocRef, { reactions: updatedReactions });
  }

  /**
   * Checks if a user has already reacted to a message with a specific reaction type.
   * @param {any[]} reactions - The array of reactions.
   * @param {string} reactionType - The type of reaction to check.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the user has reacted.
   */
  async hasUserReacted(reactions: any[], reactionType: string, userId: string): Promise<boolean> {
    return reactions.some(reaction => reaction.type === reactionType && reaction.userId === userId);
  }
}
