import {Component, EventEmitter, Output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ImageCropperService} from '../services/image-cropper';

type ClothingCategory = 'top' | 'bottom' | 'dress' | 'shoes' | 'accessories';

interface UploadClothing {
  id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  originalImage: string;
  croppedImage: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.css'
})
export class FileUploadComponent {
  @Output() clothingAdded = new EventEmitter<UploadClothing>();

  isProcessing = signal(false);
  uploadProgress = signal(0);
  previewImage = signal<string | null>(null);
  processedImage = signal<string | null>(null);

  // Form data
  selectedCategory = signal<ClothingCategory>('top');
  itemName = signal(' ');
  itemColor = signal(' ');

  categories: { value: ClothingCategory; label: string }[] = [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'dress', label: 'Dress' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'accessories', label: 'Accessories' }
  ];


  constructor(private imageCropper: ImageCropperService) { }

    onFileSelected(event: Event) {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];

      if (!file) return;

      // Show preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage.set(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Auto-generate name from filename
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      this.itemName.set(fileName);

      // Process the image
      this.processImage(file);
    }

  private async processImage(file: File) {
    this.isProcessing.set(true);
    this.uploadProgress = signal(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        const current = this.uploadProgress();
        if (current < 90) {
          this.uploadProgress.set(current + 10);
        }
      }, 200);

      // Remove background
      const croppedImageUrl = await this.imageCropper.removeBackground(file);

      // Complete progress
      clearInterval(progressInterval);
      this.uploadProgress.set(100);
      // Store processed image and show form for user to confirm details
      this.processedImage.set(croppedImageUrl);

    } catch (error) {
      console.error('Image processing failed: ', error);
      alert('Failed to process image. Please try again.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  private resetForm() {
    this.previewImage.set(null);
    this.processedImage.set(null);
    this.itemName.set('');
    this.itemColor.set('');
    this.uploadProgress.set(0);
  }

  updateName(event: Event) {
    const input = event.target as HTMLInputElement;
    this.itemName.set(input.value);
  }

  updateColor(event: Event) {
    const input = event.target as HTMLInputElement;
    this.itemColor.set(input.value);
  }

  updateCategory(category: ClothingCategory) {
    this.selectedCategory.set(category);
  }

  saveItem() {
    if (!this.previewImage()) return;
    const clothingItem: UploadClothing = {
      id: `upload-${Date.now()}`,
      name: this.itemName() || 'New Item',
      category: this.selectedCategory(),
      color: this.itemColor() || 'Unknown',
      originalImage: this.previewImage()!,
      croppedImage: this.processedImage() || this.previewImage()!,
    };
    this.clothingAdded.emit(clothingItem);
    this.resetForm();
  }



}



