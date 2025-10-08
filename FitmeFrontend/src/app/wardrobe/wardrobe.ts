// src/app/wardrobe/wardrobe.ts - Enhanced version
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FileUploadComponent} from '../file-upload/file-upload';

interface ClothingItem {
  id: string;
  name: string;
  imageUrl: string;
  category: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessories';
  color: string;
  isFavorite: boolean;
}

@Component({
  selector: 'app-wardrobe',
  standalone: true,
  imports: [CommonModule, FileUploadComponent],
  templateUrl: './wardrobe.html',
  styleUrl: './wardrobe.css'
})
export class WardrobeComponent {
  // State signals
  selectedCategory = signal<string>('all');

  clothingItems = signal<ClothingItem[]>([
    {
      id: '1',
      name: 'Blue Denim Shirt',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
      category: 'top',
      color: 'Blue',
      isFavorite: false
    },
    {
      id: '2',
      name: 'Black Skinny Jeans',
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
      category: 'bottom',
      color: 'Black',
      isFavorite: true
    },
    {
      id: '3',
      name: 'Summer Dress',
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=300&fit=crop',
      category: 'dress',
      color: 'Yellow',
      isFavorite: false
    },
    {
      id: '4',
      name: 'White Sneakers',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop',
      category: 'shoes',
      color: 'White',
      isFavorite: true
    }
  ]);

  // Categories for filtering
  categories = [
    { value: 'all', label: 'All Items', icon: '👕' },
    { value: 'top', label: 'Tops', icon: '👔' },
    { value: 'bottom', label: 'Bottoms', icon: '👖' },
    { value: 'dress', label: 'Dresses', icon: '👗' },
    { value: 'shoes', label: 'Shoes', icon: '👟' },
    { value: 'accessories', label: 'Accessories', icon: '👜' }
  ];

  // Computed signal for filtered items
  filteredItems = computed(() => {
    const category = this.selectedCategory();
    const items = this.clothingItems();

    if (category === 'all') {
      return items;
    }
    return items.filter(item => item.category === category);
  });

  // Methods
  selectCategory(category: string) {
    this.selectedCategory.set(category);
  }

  toggleFavorite(itemId: string) {
    const items = this.clothingItems();
    const updatedItems = items.map(item =>
      item.id === itemId
        ? { ...item, isFavorite: !item.isFavorite }
        : item
    );
    this.clothingItems.set(updatedItems);
  }

  deleteItem(itemId: string) {
    if (confirm('Are you sure you want to delete this item?')) {
      const items = this.clothingItems();
      const updatedItems = items.filter(item => item.id !== itemId);
      this.clothingItems.set(updatedItems);
    }
  }

  onDragStart(event: DragEvent, item: ClothingItem) {
    const itemData = JSON.stringify({
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      category: item.category
    });

    event.dataTransfer?.setData('clothing-item', itemData);
    event.dataTransfer!.effectAllowed = 'copy';

    (event.target as HTMLElement).style.opacity = '0.5';
  }

  showUpload = signal(false);

  addItem() {
    if (this.showUpload()) {
        this.showUpload.set(false); // close previous one if still open
        setTimeout(() => this.showUpload.set(true)); // reopen cleanly
      } else {
        this.showUpload.set(true);
      }
  }

  onClothingAdded(uploadedItem: any) {
    // Convert uploaded item to ClothingItem format
    const newItem: ClothingItem = {
      id: uploadedItem.id,
      name: uploadedItem.name,
      imageUrl: uploadedItem.croppedImage || uploadedItem.originalImage,
      category: uploadedItem.category,
      color: uploadedItem.color,
      isFavorite: false
    };

    // Add to wardrobe
    const currentItems = this.clothingItems();
    this.clothingItems.set([...currentItems, newItem]);

    // Hide upload form
    this.showUpload.set(false);

    console.log('New item added:', newItem);
  }
}
