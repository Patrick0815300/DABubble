import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs } from '@angular/fire/firestore';
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
    return doc(collection(this.firestore, colId), docId);
  }

  async getDocIdsByColId(colId: string): Promise<string[]> {
    const collectionRef = collection(this.firestore, colId);
    const snapshot = await getDocs(collectionRef);
    const docIds = snapshot.docs.map(doc => doc.id);
    return docIds;
  }

  async assignDocId(colId: string, docId: string): Promise<void> {
    const docRef = this.getSingleChannelRef(colId, docId)
    return updateDoc(docRef, {
      docId: docId
    })
      .then(() => {
        console.log(`docId erfolgreich zugewiesen: ${docId}`);
      })
      .catch((error) => {
        console.error('Fehler beim Zuweisen der docId: ', error);
      });
  }
}