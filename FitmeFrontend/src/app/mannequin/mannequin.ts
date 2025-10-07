// src/app/mannequin/mannequin.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PlacedItem {
  id: string;
  imageUrl: string;
  name: string;
  category: string;
  position: { x: number; y: number };
  zIndex: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-mannequin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mannequin.html',
  styleUrl: './mannequin.css'
})
export class MannequinComponent {
  placedItems = signal<PlacedItem[]>([]);


  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();

    const clothingData = event.dataTransfer?.getData('clothing-item');
    if (!clothingData) return;

    const item = JSON.parse(clothingData);

    const mannequinArea = event.currentTarget as HTMLElement;
    const rect = mannequinArea.getBoundingClientRect();

    // Calculate position relative to mannequin
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log('Drop position: ', { x, y });
    console.log('Mannequin area size: ', { width: rect.width, height: rect.height });

    // Get mannequin center for better positioning
    const mannequinCenterX = rect.width / 2;
    const mannequinCenterY = rect.height / 2;

    // Smart positioning based on category
    const anchor = this.getSmartPosition(item.category, x, y, mannequinCenterX, mannequinCenterY);

    console.log('Smart position:', anchor);

    const clothingImg = new Image();
    clothingImg.src = item.imageUrl;

    clothingImg.onload = () => {
      const scale = this.getScaleForCategory(item.category);
      const clothingWidth = clothingImg.width * scale;
      const clothingHeight = clothingImg.height * scale;

      const centeredPosition = {
        x: anchor.x - clothingWidth / 2,
        y: anchor.y - clothingHeight / 2
      };

      const placedItem: PlacedItem = {
        id: `placed-${Date.now()}`,
        imageUrl: item.imageUrl,
        name: item.name,
        category: item.category,
        position: anchor,
        zIndex: this.getZIndexForCategory(item.category),
        width: clothingWidth,
        height: clothingHeight
      };

      // Add to placed items
      const currentItems = this.placedItems();
      this.placedItems.set([...currentItems, placedItem]);
    }
  }

  private getSmartPosition(category: string, dropX: number, dropY: number, centerX: number, centerY: number) {
    // The mannequin SVG is 200px wide and centered in the area
    // So the mannequin actually starts at: centerX - 100
    const mannequinLeft = centerX - 100;  // Left edge of mannequin
    const mannequinCenterX = centerX;     // Center of mannequin
    const mannequinTop = centerY - 200;   // Top of mannequin (400px tall)

    console.log('Mannequin bounds:', {
      left: mannequinLeft,
      centerX: mannequinCenterX,
      top: mannequinTop
    });

    switch (category) {
      case 'top':
        return {
          x: mannequinCenterX - 50,    // Center on mannequin torso
          y: mannequinTop + 120        // Upper torso area
        };
      case 'bottom':
        return {
          x: mannequinCenterX - 50,    // Center on mannequin
          y: mannequinTop + 200        // Lower torso/hip area
        };
      case 'dress':
        return {
          x: mannequinCenterX - 60,    // Slightly wider for dress
          y: mannequinTop + 140        // Full torso coverage
        };
      case 'shoes':
        return {
          x: mannequinCenterX - 40,    // Center on feet
          y: mannequinTop + 340        // Feet area
        };
      case 'accessories':
        return {
          x: mannequinCenterX - 30,    // Center on neck
          y: mannequinTop + 80         // Neck/head area
        };
      default:
        return {
          x: Math.max(10, Math.min(dropX - 50, centerX * 2 - 110)),
          y: Math.max(10, Math.min(dropY - 50, centerY * 2 - 110))
        };
    }
  }


  private getZIndexForCategory(category: string): number {
    const zIndexMap: { [key: string]: number } = {
      'bottom': 1,  // Pants/skirts go behind
      'dress': 2,   // Dresses in middle
      'top': 3,     // Shirts/jackets on top
      'shoes': 0,   // Shoes at bottom
      'accessories': 4  // Accessories on top
    };
    return zIndexMap[category] || 2;
  }

  private getScaleForCategory(category: string): number {
    const scaleMap: { [key: string]: number } = {
      'top': 0.8,
      'bottom': 0.7,
      'dress': 0.9,
      'shoes': 0.6,
      'accessories': 0.5
    };
    return scaleMap[category] || 0.8;
  }

  removeItem(itemId: string) {
    const currentItems = this.placedItems();
    this.placedItems.set(currentItems.filter(item => item.id !== itemId));
  }

  clearAll() {
    this.placedItems.set([]);
  }
}
