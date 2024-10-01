import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainServiceService {

  uid: string = '';

  constructor(private firestore: Firestore, private route: ActivatedRoute, private router: Router) { }

  /**
   * This function extracts the last segment of the current URL (e.g., the UID) and stores it.
   */
  extractLastUrlSegment(): void {
    const currentUrl = this.router.url; // Gibt die aktuelle URL zurück
    const urlSegments = currentUrl.split('/'); // Zerlegt die URL in Teile basierend auf "/"
    this.uid = urlSegments[urlSegments.length - 1]; // Nimmt den letzten Teil der URL
    console.log('Letzter Teil der URL:', this.uid);
    // Hier kannst du die lastSegment verwenden (z.B. in Firestore speichern oder für weitere Logik nutzen)
  }

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