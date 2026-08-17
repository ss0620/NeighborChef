import * as Location from 'expo-location';

export interface ResolvedLocation {
  address: string;
  lat: number;
  lng: number;
}

/** Requests permission (if needed) and resolves the device's current location to a display address. */
export async function getCurrentLocation(): Promise<ResolvedLocation | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  const position = await Location.getCurrentPositionAsync({});
  const [place] = await Location.reverseGeocodeAsync({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });

  const address = place
    ? [place.name, place.city, place.region].filter(Boolean).join(', ')
    : `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;

  return { address, lat: position.coords.latitude, lng: position.coords.longitude };
}
