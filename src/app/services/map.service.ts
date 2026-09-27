import { ElementRef, Injectable } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat, toLonLat } from 'ol/proj';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { Marker } from '../models/marker.model';

/**
 * Service for managing the OpenLayers map instance and rendering marker vector layers.
 */
@Injectable({
  providedIn: 'root'
})
export class MapService {
  private map?: Map;
  private readonly vectorSource = new VectorSource();

  /**
   * Initializes the OpenLayers map in the given HTML target element.
   *
   * @param target - ElementRef pointing to the map container HTML element.
   */
  initMap(target: ElementRef<HTMLElement>): void {
    const vectorLayer = new VectorLayer({
      source: this.vectorSource
    });

    this.map = new Map({
      target: target.nativeElement,
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer // Vector layer on top of base map
      ],
      view: new View({
        center: fromLonLat([30.5234, 50.4501]), // Kyiv: [longitude, latitude]
        zoom: 12
      })
    });
  }

  /**
   * Returns the OpenLayers Map instance, or undefined if not initialized yet.
   */
  getMap(): Map | undefined {
    return this.map;
  }

  /**
   * Synchronizes the array of markers with the OpenLayers vector layer.
   *
   * @param markers - List of Marker models to render on the map.
   */
  updateMarkers(markers: Marker[]): void {
    this.vectorSource.clear();

    const features = markers.map(marker => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([marker.longitude, marker.latitude])),
        markerData: marker
      });

      const color = marker.style?.color || '#e74c3c';
      const opacity = marker.style?.opacity ?? 1;

      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: this.hexToRgba(color, opacity) }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
          })
        })
      );

      return feature;
    });

    this.vectorSource.addFeatures(features);
  }

  /**
   * Helper function to convert HEX color string and numeric opacity to RGBA format.
   */
  private hexToRgba(hex: string, opacity: number): string {
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const match = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(clean);
    return match
      ? `rgba(${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)}, ${opacity})`
      : hex;
  }

  onRightClick(callback: (lon: number, lat: number) => void): void {
    if (!this.map) return;
    this.map.getViewport().addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      if (!this.map) return;
      
      const coordinate = this.map.getEventCoordinate(e);
      if (coordinate) {
        const [lon, lat] = toLonLat(coordinate);
        callback(lon, lat);
      }
    });
  }
}
