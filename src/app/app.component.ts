import { Component } from '@angular/core';
import { MapComponent } from './map/map.component';
import { MarkerListComponent } from './marker-list/marker-list.component';

@Component({
  selector: 'app-root',
  imports: [MapComponent, MarkerListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'map-marker';
}
