import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ImageCropperService {

  private apiUrl = environment.apiUrl; // backend endpoint

  constructor(private http: HttpClient) {}

  async removeBackground(imageFile: File): Promise<string> {
    console.log('Starting background removal...');

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const blob = await this.http.post(this.apiUrl, formData, { responseType: 'blob' }).toPromise();
      return await this.blobToBase64(blob!);
    } catch (error) {
      console.error('Background removal failed:', error);
      return this.fileToBase64(imageFile);
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
