import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Marker, CreateMarkerDto } from '../models/marker.model';
import { AddMarker, DeleteMarker, SelectMarker, ClearAllMarkers, UpdateMarker, UpdateMarkerDto } from '../store/markers/marker.actions';
import { MarkerState } from '../store/markers/marker.state';
import { MarkerDialogComponent } from '../marker-dialog/marker-dialog.component';

@Component({
  selector: 'app-marker-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DynamicDialogModule],
  providers: [DialogService],
  templateUrl: './marker-list.component.html',
  styleUrl: './marker-list.component.scss'
})
export class MarkerListComponent implements OnDestroy {
  private readonly store = inject(Store);
  private readonly dialogService = inject(DialogService);
  private dialogRef?: DynamicDialogRef;

  readonly markers = this.store.selectSignal(MarkerState.getMarkers);
  readonly markerCount = this.store.selectSignal(MarkerState.getMarkerCount);
  readonly selectedMarker = this.store.selectSignal(MarkerState.getSelectedMarker);

  readonly searchQuery = signal<string>('');

  readonly filteredMarkers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.markers();
    if (!query) return list;
    return list.filter(m =>
      m.title.toLowerCase().includes(query) ||
      (m.description && m.description.toLowerCase().includes(query))
    );
  });

  openAddDialog(latitude = 50.4501, longitude = 30.5234): void {
    this.dialogRef = this.dialogService.open(MarkerDialogComponent, {
      header: 'New Marker',
      width: '420px',
      modal: true,
      breakpoints: {
        '576px': '92vw'
      },
      data: {
        latitude,
        longitude
      }
    });

    this.dialogRef.onClose.subscribe((result: CreateMarkerDto | undefined) => {
      if (result) {
        this.store.dispatch(new AddMarker(result));
      }
    });
  }

  onEdit(marker: Marker, event: MouseEvent): void {
    event.stopPropagation();
    this.dialogRef = this.dialogService.open(MarkerDialogComponent, {
      header: 'Edit Marker',
      width: '420px',
      modal: true,
      breakpoints: {
        '576px': '92vw'
      },
      data: marker
    });

    this.dialogRef.onClose.subscribe((result: UpdateMarkerDto | undefined) => {
      if (result) {
        this.store.dispatch(new UpdateMarker(marker.id, result));
      }
    });
  }

  onSelect(marker: Marker): void {
    this.store.dispatch(new SelectMarker(marker.id));
  }

  onDelete(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.store.dispatch(new DeleteMarker(id));
  }

  onClearAll(): void {
    if (confirm('Are you sure you want to remove all markers?')) {
      this.store.dispatch(new ClearAllMarkers());
    }
  }

  ngOnDestroy(): void {
    this.dialogRef?.destroy();
  }
}
