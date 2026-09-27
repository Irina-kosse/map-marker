import { CreateMarkerDto } from '../../models/marker.model';

export type UpdateMarkerDto = Partial<CreateMarkerDto>;

export class AddMarker {
  static readonly type = '[Marker] Add';
  constructor(public payload: CreateMarkerDto) {}
}

export class UpdateMarker {
  static readonly type = '[Marker] Update';
  constructor(public id: string, public payload: UpdateMarkerDto) {}
}

export class DeleteMarker {
  static readonly type = '[Marker] Delete';
  constructor(public id: string) {}
}

export class SelectMarker {
  static readonly type = '[Marker] Select';
  constructor(public id: string | null) {}
}

export class ClearAllMarkers {
  static readonly type = '[Marker] Clear All';
}