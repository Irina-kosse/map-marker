import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Marker } from '../../models/marker.model';
import { AddMarker, UpdateMarker, DeleteMarker, SelectMarker, ClearAllMarkers } from './marker.actions';

export interface MarkerStateModel {
  markers: Marker[];
  selectedMarkerId: string | null;
}

@State<MarkerStateModel>({
  name: 'markers',
  defaults: {
    markers: [],
    selectedMarkerId: null
  }
})
@Injectable()
export class MarkerState {

  @Selector()
  static getMarkers(state: MarkerStateModel): Marker[] {
    return state.markers;
  }

  @Selector()
  static getMarkerCount(state: MarkerStateModel): number {
    return state.markers.length;
  }

  @Selector()
  static getSelectedMarkerId(state: MarkerStateModel): string | null {
    return state.selectedMarkerId;
  }

  @Selector()
  static getSelectedMarker(state: MarkerStateModel): Marker | null {
    return state.markers.find(marker => marker.id === state.selectedMarkerId) ?? null;
  }

  @Action(AddMarker)
  add(ctx: StateContext<MarkerStateModel>, { payload }: AddMarker): void {
    const state = ctx.getState();
    const newMarker: Marker = {
      ...payload,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      createdAt: new Date()
    };

    ctx.patchState({
      markers: [...state.markers, newMarker]
    });
  }

  @Action(UpdateMarker)
  update(ctx: StateContext<MarkerStateModel>, { id, payload }: UpdateMarker): void {
    const state = ctx.getState();
    const updatedMarkers = state.markers.map(marker =>
      marker.id === id ? { ...marker, ...payload } : marker
    );

    ctx.patchState({
      markers: updatedMarkers
    });
  }

  @Action(DeleteMarker)
  delete(ctx: StateContext<MarkerStateModel>, { id }: DeleteMarker): void {
    const state = ctx.getState();
    ctx.patchState({
      markers: state.markers.filter(marker => marker.id !== id),
      selectedMarkerId: state.selectedMarkerId === id ? null : state.selectedMarkerId
    });
  }

  @Action(SelectMarker)
  select(ctx: StateContext<MarkerStateModel>, { id }: SelectMarker): void {
    ctx.patchState({
      selectedMarkerId: id
    });
  }

  @Action(ClearAllMarkers)
  clearAll(ctx: StateContext<MarkerStateModel>): void {
    ctx.patchState({
      markers: [],
      selectedMarkerId: null
    });
  }
}