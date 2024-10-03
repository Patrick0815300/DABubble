import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { addDoc, collection, collectionData, doc, docData, Firestore, FirestoreModule, onSnapshot, query, where } from '@angular/fire/firestore';
import { FirebaseAppModule } from '@angular/fire/app';
import { User, Message } from './modules/database.model';
import { BehaviorSubject, filter, last, map, Observable, Subject, Subscription, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatabaseServiceService {
  unSubscribeUser;
  unSubscribeMsg;
  userData$: any;
  messageData$: any;
  private userSubscribe!: Subscription;
  private msgSubscribe!: Subscription;
  users: User[] = [new User()];
  messages: Message[] = [new Message()];
  private allDirectMessages: any[] = [];
  CURRENT_USER: any;

  private logSubject = new BehaviorSubject<User>(new User());
  private usersSubject = new BehaviorSubject<User[]>([new User()]);
  private messagesSubject = new BehaviorSubject<Message[]>([new Message()]);
  private chatMessagesSubject = new BehaviorSubject<Message[]>([new Message()]);
  private filteredMessagesSource = new Subject<Message[]>();
  private onlineUsersSubject = new BehaviorSubject<any[]>([]);
  private userByIdSubject = new BehaviorSubject<any | null>(null);

  nameState$ = this.logSubject.asObservable();
  users$ = this.usersSubject.asObservable();
  messages$ = this.messagesSubject.asObservable();
  chatMessages$ = this.chatMessagesSubject.asObservable();
  onlineUsers$ = this.onlineUsersSubject.asObservable();
  filteredMessages$ = this.filteredMessagesSource.asObservable();
  userById$ = this.userByIdSubject.asObservable();

  constructor(private firestore: Firestore) {
    this.unSubscribeUser = this.snapUsers();
    this.unSubscribeMsg = this.snapMessages();
    this.getOnlineUsers();
  }

  getAllUsers(): Observable<User[]> {
    const usersCollection = collection(this.firestore, 'users');
    return collectionData(usersCollection, { idField: 'id' }) as Observable<User[]>;
  }
  getAllMessages(): Observable<Message[]> {
    const usersCollection = collection(this.firestore, 'messages');
    return collectionData(usersCollection, { idField: 'id' }) as Observable<Message[]>;
  }

  snapUsers(): Observable<User[]> {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(this.getUsersRef(), snapshot => {
        const users: User[] = [];
        snapshot.forEach(element => {
          users.push(new User(element.data()));
        });
        this.usersSubject.next(users);
        observer.next(users);
      });

      return { unsubscribe };
    });
  }

  snapMessages(): Observable<Message[]> {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(this.getMessagesRef(), snapshot => {
        const messages: Message[] = [];
        snapshot.forEach(element => {
          messages.push(new Message(element.data()));
        });
        this.messagesSubject.next(messages);
        observer.next(messages);
      });

      return { unsubscribe };
    });
  }

  getUsersRef() {
    const userRef = collection(this.firestore, 'users');
    return userRef;
  }
  getMessagesRef() {
    const userRef = collection(this.firestore, 'messages');
    return userRef;
  }

  async addUser(newUser: object) {
    const userRef = collection(this.firestore, 'users');
    try {
      const docRef = await addDoc(userRef, newUser);
      console.log('Document written with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }
  async addMessage(newMessage: object) {
    const msgRef = collection(this.firestore, 'messages');
    try {
      const docRef = await addDoc(msgRef, newMessage);
      console.log('Document written with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }

  //////////////// MANIPULATE DATA IN THE DATABASE ////////////*css*/`

  /**
   *get the current authenticated user
   * @returns {User}
   */
  getOnlineUsers() {
    const onlineUsersQuery = query(this.getUsersRef(), where('online', '==', true));

    onSnapshot(onlineUsersQuery, snapshot => {
      const onlineUsers = snapshot.docs.map(doc => doc.data());
      this.onlineUsersSubject.next(onlineUsers);
    });
  }

  getUserById(userId: string, callback: (user: any | null) => void) {
    const userQuery = query(this.getUsersRef(), where('user_id', '==', userId));

    onSnapshot(userQuery, snapshot => {
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        this.userByIdSubject.next(userData);
        callback(userData);
      } else {
        this.userByIdSubject.next(null);
        callback(null);
      }
    });
  }

  getMessages(currentUserId: string | undefined, targetUserId: string, callback: (messages: any[] | null) => void) {
    const messagesQuery = query(this.getMessagesRef(), where('from_user', 'in', [currentUserId, targetUserId]), where('to_user', 'in', [currentUserId, targetUserId]));

    onSnapshot(messagesQuery, snapshot => {
      if (!snapshot.empty) {
        const messages = snapshot.docs.map(doc => doc.data());
        callback(messages);
      } else {
        callback(null);
      }
    });
  }

  authenticatedUser(): Observable<User> {
    return this.snapUsers().pipe(map(users => users.filter(user => user.online === true)[0]));
  }

  /**
   *
   * @param {string} id - Id of the user whose name need to be found
   * @returns {string} - name of the user
   */

  userFromId(id: string | undefined): Observable<User> {
    return this.snapUsers().pipe(
      map(users => users.filter(user => user.user_id === id)[0]) // Filter users by the given ID
    );
  }

  pictureFromId(id: string | undefined): Observable<string> {
    return this.snapUsers().pipe(
      map(users => users.filter(user => user.user_id === id)[0].image_file) // Filter users by the given ID
    );
  }

  pictureFromID(id: string): string {
    let user = this.users.find(user => user.user_id === id)!;
    return `${user?.image_file}`;
  }
  nameFromId(id: string | undefined): string {
    let user = this.users.find(user => user.user_id === id);
    return `${user?.first_name}`;
  }

  directMessages(currentUserId: string | undefined): Observable<Message[]> {
    return this.snapMessages().pipe(
      map(messages => {
        return messages.filter(message => message.from_user === currentUserId || message.to_user === currentUserId);
      })
    );
  }

  filterDirectMessages(currentUserId: string | undefined, targetUserId: string | undefined): void {
    this.snapMessages()
      .pipe(
        map(messages => {
          const directMessages = messages.filter(message => message.from_user === currentUserId || message.to_user === currentUserId);
          const filteredMessages = directMessages.filter(msg => msg.to_user === targetUserId || msg.from_user === targetUserId);
          return filteredMessages;
        })
      )
      .subscribe(filteredMessages => {
        this.filteredMessagesSource.next(filteredMessages);
      });
  }

  ////*css*/`
}
