import { Component, ElementRef, inject, viewChild, afterNextRender, OnDestroy, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { Popover, PopoverModule } from 'primeng/popover';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import { fromLonLat } from 'ol/proj';
import { MapService } from '../services/map.service';
import { MarkerState } from '../store/markers/marker.state';
import { AddMarker, DeleteMarker, UpdateMarker, UpdateMarkerDto } from '../store/markers/marker.actions';
import { MarkerDialogComponent } from '../marker-dialog/marker-dialog.component';
import { clampLatitude, clampLongitude, CreateMarkerDto, Marker } from '../models/marker.model';

@Component({
  selector: 'app-map',
  imports: [CommonModule, DynamicDialogModule, PopoverModule, ConfirmPopupModule],
  providers: [DialogService, ConfirmationService],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  standalone: true
})
export class MapComponent implements OnDestroy {
  private readonly mapService = inject(MapService);
  private readonly store = inject(Store);
  private readonly dialogService = inject(DialogService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly mapContainer = viewChild.required<ElementRef<HTMLElement>>('mapContainer');
  readonly popoverAnchor = viewChild.required<ElementRef<HTMLElement>>('popoverAnchor');
  readonly markerPopover = viewChild<Popover>('markerPopover');

  readonly markers = this.store.selectSignal(MarkerState.getMarkers);
  readonly selectedMarker = this.store.selectSignal(MarkerState.getSelectedMarker);

  contextMarker: Marker | null = null;

  constructor() {
    afterNextRender(() => {
      this.mapService.initMap(this.mapContainer());
      this.mapService.updateMarkers(this.markers());

      const map = this.mapService.getMap();
      map?.on('movestart', () => {
        this.markerPopover()?.hide();
      });

      // Hide context menu and clear popover marker when dragging starts
      this.mapService.onMarkerDragStart(() => {
        this.markerPopover()?.hide();
        this.contextMarker = null;
      });

      // Dispatch updated coordinates to NGXS store when dragging ends
      this.mapService.onMarkerDragEnd((id, lat, lon) => {
        const cleanLat = clampLatitude(Number(lat.toFixed(6)));
        const cleanLon = clampLongitude(Number(lon.toFixed(6)));
        const current = this.markers().find(m => m.id === id);
        if (current && (current.latitude !== cleanLat || current.longitude !== cleanLon)) {
          this.store.dispatch(new UpdateMarker(id, { latitude: cleanLat, longitude: cleanLon }));
        }
      });

      // Right-click handling: open popover anchored to marker, or open add dialog on empty map
      this.mapService.onRightClick((lon, lat, clickedMarker, event) => {
        if (clickedMarker && event) {
          const mapInstance = this.mapService.getMap();
          const pixel = mapInstance?.getPixelFromCoordinate(
            fromLonLat([clickedMarker.longitude, clickedMarker.latitude])
          );

          const anchorEl = this.popoverAnchor().nativeElement;
          if (pixel) {
            anchorEl.style.left = `${pixel[0]}px`;
            anchorEl.style.top = `${pixel[1]}px`;
          } else {
            anchorEl.style.left = `${event.offsetX}px`;
            anchorEl.style.top = `${event.offsetY}px`;
          }

          this.contextMarker = clickedMarker;
          this.cdr.detectChanges();
          this.markerPopover()?.show(event, anchorEl);
        } else {
          this.markerPopover()?.hide();
          this.contextMarker = null;
          this.openAddDialog(lat, lon);
        }
      });
    });

    // Synchronize markers on the map whenever store markers change
    effect(() => {
      const markers = this.markers();
      this.mapService.updateMarkers(markers);
    });

    // Smoothly pan and zoom to selected marker
    let lastAnimatedMarkerId: string | null = null;
    effect(() => {
      const selected = this.selectedMarker();
      if (selected && selected.id !== lastAnimatedMarkerId) {
        lastAnimatedMarkerId = selected.id;
        const map = this.mapService.getMap();
        map?.getView().animate({
          center: fromLonLat([selected.longitude, selected.latitude]),
          zoom: 14,
          duration: 600
        });
      } else if (!selected) {
        lastAnimatedMarkerId = null;
      }
    });
  }

  onEditFromPopover(): void {
    if (!this.contextMarker) return;
    const markerToEdit = this.contextMarker;
    this.markerPopover()?.hide();

    const ref = this.dialogService.open(MarkerDialogComponent, {
      header: 'Edit Marker',
      width: '420px',
      modal: true,
      breakpoints: { '576px': '92vw' },
      data: markerToEdit
    });

    ref.onClose.subscribe((result: UpdateMarkerDto | undefined) => {
      if (result) {
        this.store.dispatch(new UpdateMarker(markerToEdit.id, result));
      }
    });
  }

  onDeleteFromPopover(event: Event): void {
    if (!this.contextMarker) return;
    const markerId = this.contextMarker.id;

    this.confirmationService.confirm({
      target: event.currentTarget as HTMLElement,
      message: 'Are you sure you want to proceed?',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: {
        severity: 'danger'
      },
      accept: () => {
        this.store.dispatch(new DeleteMarker(markerId));
        this.markerPopover()?.hide();
        this.contextMarker = null;
      }
    });
  }

  private openAddDialog(latitude: number, longitude: number): void {
    const ref = this.dialogService.open(MarkerDialogComponent, {
      header: 'New Marker',
      width: '420px',
      modal: true,
      breakpoints: { '576px': '92vw' },
      data: {
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6))
      }
    });

    ref.onClose.subscribe((result: CreateMarkerDto | undefined) => {
      if (result) {
        this.store.dispatch(new AddMarker(result));
      }
    });
  }

  ngOnDestroy(): void {
    this.mapService.getMap()?.setTarget(undefined);
  }
}
