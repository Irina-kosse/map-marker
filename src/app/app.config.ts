import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { DialogService } from 'primeng/dynamicdialog';
import { provideStore } from '@ngxs/store';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { routes } from './app.routes';
import { MarkerState } from './store/markers/marker.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    DialogService,
    provideStore(
      [MarkerState],

      withNgxsLoggerPlugin(),
      withNgxsStoragePlugin({
        keys: [MarkerState],
        afterDeserialize: (obj, key) => {
          if (key === 'markers' && obj && Array.isArray(obj.markers)) {
            return {
              ...obj,
              markers: obj.markers.map((m: any) => ({
                ...m,
                createdAt: new Date(m.createdAt)
              }))
            };
          }
          return obj;
        }
      })
    )
  ]
};
