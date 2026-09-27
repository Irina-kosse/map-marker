import { Component, ElementRef, inject, viewChild, afterNextRender, OnDestroy, effect } from '@angular/core';
import { Store } from '@ngxs/store';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { fromLonLat } from 'ol/proj';
import { MapService } from '../services/map.service';
import { MarkerState } from '../store/markers/marker.state';
import { AddMarker } from '../store/markers/marker.actions';
import { MarkerDialogComponent } from '../marker-dialog/marker-dialog.component';
import { CreateMarkerDto } from '../models/marker.model';

@Component({
  selector: 'app-map',
  imports: [DynamicDialogModule],
  providers: [DialogService],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  standalone: true
})
export class MapComponent implements OnDestroy {
  private readonly mapService = inject(MapService);
  private readonly store = inject(Store);
  private readonly dialogService = inject(DialogService);

  readonly mapContainer = viewChild.required<ElementRef<HTMLElement>>('mapContainer');
  readonly markers = this.store.selectSignal(MarkerState.getMarkers);
  readonly selectedMarker = this.store.selectSignal(MarkerState.getSelectedMarker);

  constructor() {
    afterNextRender(() => {
      this.mapService.initMap(this.mapContainer());
      this.mapService.updateMarkers(this.markers());

      // Open creation dialog on right-click with clicked coordinates
      this.mapService.onRightClick((lon, lat) => {
        this.openAddDialog(lat, lon);
      });
    });

    // Synchronize markers on the map whenever store markers change
    effect(() => {
      const markers = this.markers();
      this.mapService.updateMarkers(markers);
    });

    // Smoothly pan and zoom to selected marker
    effect(() => {
      const selected = this.selectedMarker();
      if (selected) {
        const map = this.mapService.getMap();
        map?.getView().animate({
          center: fromLonLat([selected.longitude, selected.latitude]),
          zoom: 14,
          duration: 600
        });
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
