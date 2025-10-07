// src/app/app.ts - Update to show both components
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WardrobeComponent } from './wardrobe/wardrobe';
import { MannequinComponent } from './mannequin/mannequin';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    WardrobeComponent,
    MannequinComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('FitmeFrontend');
}
