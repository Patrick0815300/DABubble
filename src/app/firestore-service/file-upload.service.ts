import { Injectable } from '@angular/core';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { deleteObject } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const fileRef = ref(storage, filePath);

      deleteObject(fileRef).then(() => {
        console.log('Datei erfolgreich gelöscht');
        resolve();  // Erfolgreich gelöscht
      }).catch((error) => {
        console.error('Fehler beim Löschen der Datei:', error);
        reject(error);  // Fehler beim Löschen
      });
    });
  }

  uploadFile(file: File, userId: string, onProgress: (progress: number) => void): Promise<{ url: string, fileName: string }> {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const storageRef = ref(storage, `uploads/${userId}/${file.name}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      // Tracke den gesamten Prozess inklusive Metadatenabruf
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          onProgress(progress);  // Fortschritt während des Uploads weitergeben
        },
        (error) => {
          console.error('Fehler beim Hochladen:', error);
          reject(error);
        },
        async () => {
          try {
            // Nach Abschluss des Uploads URL abrufen
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            // Warte kurz, um den Abschluss der gesamten Funktion zu simulieren
            setTimeout(() => {
              resolve({ url: downloadURL, fileName: file.name });
            }, 1000);  // 1 Sekunde Verzögerung nach Abschluss
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  getFileTypeFromFileName(fileName: string): string | null {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'pdf':
        return 'pdf';
      case 'mp4':
      case 'webm':
      case 'ogg':
        return 'video';
      default:
        return 'unknown';
    }
  }

}
