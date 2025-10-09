// src/app/mannequin/mannequin.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreShapeComponent, StageComponent } from 'ng2-konva';

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
  imports: [CommonModule, CoreShapeComponent, StageComponent],
  templateUrl: './mannequin.html',
  styleUrl: './mannequin.css'
})
export class MannequinComponent {
  stageConfig = {
    width: 400,
    height: 750,
  };

  layerConfig = {};

  placedItems = signal<any[]>([]);

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

      const bounds = this.getMaxBoundsForCategory(item.category, rect.width, rect.height);
      const fitScale = Math.min(bounds.maxWidth / desiredWidth, bounds.maxHeight / desiredHeight, 1);
      const clothingWidth = desiredWidth * fitScale;
      const clothingHeight = desiredHeight * fitScale;

      const offset = this.getAnchorOffset(item.category, clothingWidth, clothingHeight);
      let position = {
        x: anchor.x - clothingWidth / 2 + offset.x,
        y: anchor.y - clothingHeight / 2 + offset.y
      };

      // clamp
      position = {
        x: Math.max(0, Math.min(position.x, rect.width - clothingWidth)),
        y: Math.max(0, Math.min(position.y, rect.height - clothingHeight))
      };

      const config = {
        x: position.x,
        y: position.y,
        image: clothingImg,
        draggable: true,
        width: clothingWidth,
        height: clothingHeight,
        name: item.name,
        category: item.category,
      };

      const current = this.placedItems();
      this.placedItems.set([...current, config]);
    };

  }

  private getSmartPosition(category: string, dropX: number, dropY: number, centerX: number, centerY: number) {
    // Without mannequin, define anchors relative to the canvas itself
    const mannequinCenterX = centerX;
    const mannequinTop = centerY - (0.5 * (centerY * 2));

    switch (category) {
      case 'top':
        return { x: mannequinCenterX, y: centerY * 0.30 };
      case 'bottom':
        return { x: mannequinCenterX, y: centerY * 0.90 };
      case 'dress':
        return { x: mannequinCenterX, y: centerY * 0.50 };
      case 'shoes':
        return { x: mannequinCenterX, y: centerY * 1.60 };
      case 'accessories':
        return { x: mannequinCenterX, y: centerY * 0.18 };
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
      'shoes': 0.8,
      'accessories': 0.5
    };
    return scaleMap[category] || 0.8;
  }

  private getMaxBoundsForCategory(category: string, areaWidth: number, areaHeight: number): { maxWidth: number; maxHeight: number } {
    // Use a portion of the whole try-on area so items can be larger than the mannequin silhouette
    switch (category) {
      case 'top':
        return { maxWidth: areaWidth * 0.60, maxHeight: areaHeight * 0.55 };
      case 'bottom':
        return { maxWidth: areaWidth * 0.58, maxHeight: areaHeight * 0.56 };
      case 'dress':
        return { maxWidth: areaWidth * 0.55, maxHeight: areaHeight * 0.58 };
      case 'shoes':
        return { maxWidth: areaWidth * 0.32, maxHeight: areaHeight * 0.22 };
      case 'accessories':
        return { maxWidth: areaWidth * 0.28, maxHeight: areaHeight * 0.22 };
      default:
        return { maxWidth: areaWidth * 0.50, maxHeight: areaHeight * 0.50 };
    }
  }

  private getAnchorOffset(category: string, width: number, height: number): { x: number; y: number } {
    // Fine-tune how each category sits on the mannequin relative to its anchor
    switch (category) {
      case 'top':
        return { x: 0, y: -0.08 * height }; // raise tops slightly
      case 'bottom':
        return { x: 0, y: 0.20 * height }; // push bottoms down a bit more
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
