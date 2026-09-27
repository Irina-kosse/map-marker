import { Injectable, signal, computed } from '@angular/core';
import { Marker, CreateMarkerDto } from '../models/marker.model';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private readonly storageKey = 'map_markers';
  private readonly _markers = signal<Marker[]>(this.loadMarkersFromStorage());
  private readonly _selectedMarkerId = signal<string | null>(null);

  readonly markers = this._markers.asReadonly();
  readonly markerCount = computed(() => this._markers().length);
  readonly selectedMarker = computed(() =>
    this._markers().find(marker => marker.id === this._selectedMarkerId()) ?? null
  );

  getMarkers(): Marker[] {
    return this._markers();
  }

  addMarker(dto: CreateMarkerDto): Marker {
    const newMarker: Marker = {
      ...dto,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      createdAt: new Date()
    };

    this._markers.update(markers => {
      const updated = [...markers, newMarker];
      this.saveMarkersToStorage(updated);
      return updated;
    });

    return newMarker;
  }

  updateMarker(id: string, changes: Partial<CreateMarkerDto>): boolean {
    let updated = false;

    this._markers.update(markers => {
      const next = markers.map(marker => {
        if (marker.id === id) {
          updated = true;
          return { ...marker, ...changes };
        }
        return marker;
      });

      if (updated) {
        this.saveMarkersToStorage(next);
      }
      return next;
    });

    return updated;
  }

  deleteMarker(id: string): void {
    this._markers.update(markers => {
      const updated = markers.filter(marker => marker.id !== id);
      this.saveMarkersToStorage(updated);
      return updated;
    });

    if (this._selectedMarkerId() === id) {
      this._selectedMarkerId.set(null);
    }
  }

  selectMarker(id: string | null): void {
    this._selectedMarkerId.set(id);
  }

  clearAllMarkers(): void {
    this._markers.set([]);
    this._selectedMarkerId.set(null);
    this.saveMarkersToStorage([]);
  }

  private loadMarkersFromStorage(): Marker[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.map(item => ({ ...item, createdAt: new Date(item.createdAt) }))
        : [];
    } catch {
      return [];
    }
  }

  private saveMarkersToStorage(markers: Marker[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(markers));
    } catch (error) {
      console.error('Failed to save markers to localStorage', error);
    }
  }
}
