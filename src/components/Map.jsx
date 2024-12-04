import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Note: Replace with your actual Mapbox token
mapboxgl.accessToken = 'your-mapbox-token';

const Map = ({ locations, currentLocation }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    // Initialize map centered on Bainbridge Island
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [-122.5199, 47.6262],
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!map.current || !currentLocation) return;

    // Add marker for current location
    new mapboxgl.Marker({ color: '#FF0000' })
      .setLngLat([currentLocation.lng, currentLocation.lat])
      .addTo(map.current);

    // Center map on new location
    map.current.flyTo({
      center: [currentLocation.lng, currentLocation.lat],
      zoom: 15
    });
  }, [currentLocation]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
};

export default Map;