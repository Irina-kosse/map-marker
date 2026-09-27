/**
 * Branded type representing a valid geographic latitude between -90 and 90 degrees.
 */
export type Latitude = number & { readonly __brand: unique symbol };

/**
 * Branded type representing a valid geographic longitude between -180 and 180 degrees.
 */
export type Longitude = number & { readonly __brand: unique symbol };

/**
 * Branded type representing an opacity value between 0 (fully transparent) and 1 (fully opaque).
 */
export type Opacity = number & { readonly __brand: unique symbol };

/**
 * Creates and clamps a Latitude branded type to [-90, 90].
 *
 * @param value - Input latitude value.
 * @returns A validated Latitude branded type between -90 and 90.
 */
export function createLatitude(value: number): Latitude {
  const clamped = Math.min(90, Math.max(-90, value));
  return clamped as Latitude;
}

/**
 * Clamps a numeric latitude value to the valid range [-90, 90].
 *
 * @param value - Input latitude value to clamp.
 * @returns A Latitude branded type between -90 and 90 inclusive.
 */
export function clampLatitude(value: number): Latitude {
  return createLatitude(value);
}

/**
 * Creates and clamps a Longitude branded type to [-180, 180].
 *
 * @param value - Input longitude value.
 * @returns A validated Longitude branded type between -180 and 180.
 */
export function createLongitude(value: number): Longitude {
  const clamped = Math.min(180, Math.max(-180, value));
  return clamped as Longitude;
}

/**
 * Clamps a numeric longitude value to the valid range [-180, 180].
 *
 * @param value - Input longitude value to clamp.
 * @returns A Longitude branded type between -180 and 180 inclusive.
 */
export function clampLongitude(value: number): Longitude {
  return createLongitude(value);
}

/**
 * Creates and clamps an Opacity branded type to [0, 1].
 *
 * @param value - Input opacity value.
 * @returns An Opacity branded type between 0 and 1.
 */
export function createOpacity(value: number): Opacity {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped as Opacity;
}

/**
 * Clamps a numeric opacity value to the valid range [0, 1].
 *
 * @param value - Input opacity value to clamp.
 * @returns An Opacity branded type between 0 and 1 inclusive.
 */
export function clampOpacity(value: number): Opacity {
  return createOpacity(value);
}

/**
 * Represents a geographical marker on the map.
 */
export interface Marker {
  /** Unique identifier for the marker */
  id: string;

  /** Display title or name of the location */
  title: string;

  /** Optional detailed description or notes */
  description?: string;

  /** Latitude coordinate in decimal degrees (-90 to 90) */
  latitude: Latitude;

  /** Longitude coordinate in decimal degrees (-180 to 180) */
  longitude: Longitude;

  /** Timestamp when the marker was created */
  createdAt: Date;

  /** Optional visual styling of the marker */
  style?: MarkerStyle;
}

/**
 * Visual styling configuration for a map marker.
 */
export interface MarkerStyle {
  /** Color of the marker (e.g., '#e74c3c', 'rgba(255, 0, 0, 1)') */
  color: string;

  /**
   * Opacity of the marker.
   * Range: 0 (fully transparent) to 1 (fully opaque).
   */
  opacity: Opacity;
}

/**
 * Data transfer object for creating a new marker.
 * Omits auto-generated fields (`id` and `createdAt`).
 */
export type CreateMarkerDto = Omit<Marker, 'id' | 'createdAt'>;
