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
      const baseScale = this.getScaleForCategory(item.category);
      let desiredWidth = clothingImg.width * baseScale;
      let desiredHeight = clothingImg.height * baseScale;

      // Constrain by category-specific bounds relative to mannequin size
      const bounds = this.getMaxBoundsForCategory(item.category, rect.width, rect.height);
      const fitScale = Math.min(bounds.maxWidth / desiredWidth, bounds.maxHeight / desiredHeight, 1);
      const clothingWidth = desiredWidth * fitScale;
      const clothingHeight = desiredHeight * fitScale;

      const offset = this.getAnchorOffset(item.category, clothingWidth, clothingHeight);
      let centeredPosition = {
        x: anchor.x - clothingWidth / 2 + offset.x,
        y: anchor.y - clothingHeight / 2 + offset.y
      };

      // Clamp to keep within the try-on area
      centeredPosition = {
        x: Math.max(0, Math.min(centeredPosition.x, rect.width - clothingWidth)),
        y: Math.max(0, Math.min(centeredPosition.y, rect.height - clothingHeight))
      };

      const placedItem: PlacedItem = {
        id: `placed-${Date.now()}`,
        imageUrl: item.imageUrl,
        name: item.name,
        category: item.category,
        position: centeredPosition,
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
        return { x: mannequinCenterX, y: mannequinTop + 120 };
      case 'bottom':
        return { x: mannequinCenterX, y: mannequinTop + 225 };
      case 'dress':
        return { x: mannequinCenterX, y: mannequinTop + 170 };
      case 'shoes':
        return { x: mannequinCenterX, y: mannequinTop + 355 };
      case 'accessories':
        return { x: mannequinCenterX, y: mannequinTop + 80 };
      default:
        return {
          x: Math.max(10, Math.min(dropX, centerX * 2 - 10)),
          y: Math.max(10, Math.min(dropY, centerY * 2 - 10))
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

  private getMaxBoundsForCategory(category: string, areaWidth: number, areaHeight: number): { maxWidth: number; maxHeight: number } {
    // Use a portion of the whole try-on area so items can be larger than the mannequin silhouette
    switch (category) {
      case 'top':
        return { maxWidth: areaWidth * 0.35, maxHeight: areaHeight * 0.32 };
      case 'bottom':
        return { maxWidth: areaWidth * 0.38, maxHeight: areaHeight * 0.38 };
      case 'dress':
        return { maxWidth: areaWidth * 0.45, maxHeight: areaHeight * 0.48 };
      case 'shoes':
        return { maxWidth: areaWidth * 0.30, maxHeight: areaHeight * 0.20 };
      case 'accessories':
        return { maxWidth: areaWidth * 0.25, maxHeight: areaHeight * 0.20 };
      default:
        return { maxWidth: areaWidth * 0.40, maxHeight: areaHeight * 0.40 };
    }
  }

  private getAnchorOffset(category: string, width: number, height: number): { x: number; y: number } {
    // Fine-tune how each category sits on the mannequin relative to its anchor
    switch (category) {
      case 'top':
        return { x: 0, y: -0.1 * height }; // raise tops slightly
      case 'bottom':
        return { x: 0, y: 0.05 * height }; // lower bottoms a touch
      case 'dress':
        return { x: 0, y: -0.05 * height }; // nudge dresses up a bit
      case 'shoes':
        return { x: 0, y: 0.08 * height }; // push shoes down slightly
      case 'accessories':
        return { x: 0, y: -0.15 * height }; // lift accessories towards neck/head
      default:
        return { x: 0, y: 0 };
    }
  }

  removeItem(itemId: string) {
    const currentItems = this.placedItems();
    this.placedItems.set(currentItems.filter(item => item.id !== itemId));
  }

  clearAll() {
    this.placedItems.set([]);
  }
}
