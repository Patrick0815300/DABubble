import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, docData, collectionData, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainServiceService {

  constructor(private firestore: Firestore) { }

  getChannelRef(colId: string) {
    return collection(this.firestore, colId);
  }

  getSingleChannelRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId)
  }

}
