import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import LocationDetailModal from './LocationDetailModal';

mapboxgl.accessToken = 'pk.eyJ1IjoiY2VpbmFyc29uIiwiYSI6ImNtNGEybmN0ajAzOWQycXE1M2VibWNiZjkifQ.7JrNDHO9geEP_L9UT4hGgg';

const Map = ({ locations, currentLocation }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Helper function to get coordinates from a location object
  const getCoordinates = (location) => {
    if (location.coordinates) {
      return location.coordinates;
    }
    if (location.location && location.location.coordinates) {
      return location.location.coordinates;
    }
    return null;
  };

  // Helper function to get name from a location object
  const getName = (location) => {
    if (typeof location.name === 'string') {
      return location.name;
    }
    if (location.name && location.name.current) {
      return location.name.current;
    }
    return 'Unnamed Location';
  };

  useEffect(() => {
    if (map.current) return;

    try {
      console.log('Initializing map...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [-122.5199, 47.6262], // Bainbridge Island
        zoom: 12
      });

      map.current.addControl(new mapboxgl.NavigationControl());
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!map.current || !locations) return;

    console.log('Updating location markers...', locations);

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for all locations
    locations.forEach(location => {
      const coords = getCoordinates(location);
      if (!coords) return;

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div>
          <h3 class="font-bold">${getName(location)}</h3>
          <p class="text-sm">${location.shortDescription || location.content?.summary || ''}</p>
          <button 
            onclick="window.showLocationDetails('${location.id}')"
            class="mt-2 text-sm text-blue-600 hover:underline"
          >
            View Details
          </button>
        </div>
      `);

      const marker = new mapboxgl.Marker()
        .setLngLat([coords.lng, coords.lat])
        .setPopup(popup)
        .addTo(map.current);

      markers.current.push(marker);
    });

    // Add global handler for the "View Details" button
    window.showLocationDetails = (locationId) => {
      const location = locations.find(loc => loc.id === locationId);
      if (location) {
        setSelectedLocation(location);
      }
    };
  }, [locations]);

  // Update current location marker
  useEffect(() => {
    if (!map.current || !currentLocation) return;

    console.log('Setting current location:', currentLocation);

    try {
      // Add marker for current location
      const marker = new mapboxgl.Marker({ color: '#FF0000' })
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .addTo(map.current);

      markers.current.push(marker);

      // Center map on new location
      map.current.flyTo({
        center: [currentLocation.lng, currentLocation.lat],
        zoom: 15
      });
    } catch (error) {
      console.error('Error updating current location:', error);
    }
  }, [currentLocation]);

  return (
    <>
      <div 
        ref={mapContainer} 
        className="absolute inset-0"
        style={{ 
          minHeight: '400px',
          width: '100%',
          height: '100%'
        }} 
      />
      {selectedLocation && (
        <LocationDetailModal 
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      )}
    </>
  );
};

export default Map;