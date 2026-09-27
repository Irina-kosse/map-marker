import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Marker, clampLatitude, clampLongitude, clampOpacity } from '../models/marker.model';

@Component({
  selector: 'app-marker-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marker-dialog.component.html',
  styleUrl: './marker-dialog.component.scss'
})
export class MarkerDialogComponent {
  
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);

  title = '';
  description = '';
  latitude = 50.4501;
  longitude = 30.5234;
  color = '#3b82f6';
  opacity = 1;

  isEditMode = false;

  constructor() {
    const data = this.config.data as Partial<Marker> | undefined;
    if (data) {
      if (data.id) {
        this.isEditMode = true;
      }
      if (data.title) this.title = data.title;
      if (data.description) this.description = data.description;
      if (data.latitude !== undefined) this.latitude = data.latitude;
      if (data.longitude !== undefined) this.longitude = data.longitude;
      if (data.style?.color) this.color = data.style.color;
      if (data.style?.opacity !== undefined) this.opacity = data.style.opacity;
    }
  }

  onSave(): void {
    if (!this.title.trim()) {
      return;
    }

    const result = {
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      latitude: clampLatitude(this.latitude),
      longitude: clampLongitude(this.longitude),
      style: {
        color: this.color,
        opacity: clampOpacity(this.opacity)
      }
    };

    this.ref.close(result);
  }

  onCancel(): void {
    this.ref.close();
  }
}
