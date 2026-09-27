import { Component, ElementRef, inject, viewChild, afterNextRender, OnDestroy } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { MapService } from '../services/map.service';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  standalone: true
})
export class MapComponent implements OnDestroy {
  private readonly mapService = inject(MapService);

  readonly mapContainer = viewChild.required<ElementRef<HTMLElement>>('mapContainer');
  private map?: Map;

  constructor() {
    afterNextRender(() => {
      this.initMap();
    });
  }

  private initMap(): void {
    const targetElement = this.mapContainer().nativeElement;

    this.map = new Map({
      target: targetElement,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([30.5234, 50.4501]),
        zoom: 12
      })
    });
  }

  ngOnDestroy(): void {
    this.map?.setTarget(undefined);
  }
}
