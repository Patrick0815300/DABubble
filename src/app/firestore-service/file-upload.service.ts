import { Injectable } from '@angular/core';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { deleteObject } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private maxFileSizeMB: number = 5;

  private isFileSizeValid(fileSize: number): boolean {
    const fileSizeMB = fileSize / (1024 * 1024);
    return fileSizeMB <= this.maxFileSizeMB;
  }

  deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const fileRef = ref(storage, filePath);

      deleteObject(fileRef).then(() => {
        resolve();
      }).catch((error) => {
        console.error('delete File failed', error);
        reject(error);
      });
    });
  }

  uploadFile(file: File, userId: string, onProgress: (progress: number) => void): Promise<{ url: string, fileName: string }> {
    if (!this.isFileSizeValid(file.size)) {
      return Promise.reject(new Error('The file exceeds the maximum allowed size of  ' + this.maxFileSizeMB + ' MB.'));
    }
    return this.startUpload(file, userId, onProgress);
  }


  private startUpload(file: File, userId: string, onProgress: (progress: number) => void): Promise<{ url: string, fileName: string }> {
    const storage = getStorage();
    const storageRef = ref(storage, `uploads/${userId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      this.handleUploadEvents(uploadTask, onProgress, resolve, reject);
    });
  }

  private handleUploadEvents(uploadTask: any, onProgress: (progress: number) => void, resolve: any, reject: any) {
    uploadTask.on('state_changed',
      (snapshot: any) => this.trackProgress(snapshot, onProgress),
      (error: any) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ url: downloadURL, fileName: uploadTask.snapshot.ref.name });
      }
    );
  }

  private trackProgress(snapshot: any, onProgress: (progress: number) => void) {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    onProgress(progress);
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
