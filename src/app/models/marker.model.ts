export interface Marker {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
}

export type CreateMarkerDto = Omit<Marker, 'id' | 'createdAt'>;
