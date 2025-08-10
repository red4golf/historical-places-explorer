import { useState } from 'react';

export function useGeolocation() {
  const [error, setError] = useState(null);

  const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = new Error('Geolocation is not supported by your browser');
        setError(err);
        reject(err);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setError(null);
          resolve(coords);
        },
        (err) => {
          setError(err);
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });

  return { getCurrentLocation, error };
}
