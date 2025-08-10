import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import LocationDetailModal from './LocationDetailModal';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const Map = ({ locations, currentLocation }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const getCoordinates = (location) => {
    if (location.coordinates) {
      return location.coordinates;
    }
    if (location.location && location.location.coordinates) {
      return location.location.coordinates;
    }
    return null;
  };

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
        center: [-122.5199, 47.6262],
        zoom: 12
      });

      map.current.addControl(new mapboxgl.NavigationControl());
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  useEffect(() => {
    if (!map.current || !locations) return;

    console.log('Updating location markers...', locations);

    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    locations.forEach(location => {
      const coords = getCoordinates(location);
      if (!coords) return;

      const popupNode = document.createElement('div');
      popupNode.innerHTML = `
        <div>
          <h3 class="font-bold">${getName(location)}</h3>
          <p class="text-sm">${location.shortDescription || location.content?.summary || ''}</p>
          <button class="mt-2 text-sm text-blue-600 hover:underline">View Details</button>
        </div>
      `;
      popupNode.querySelector('button')?.addEventListener('click', () => {
        setSelectedLocation(location);
      });

      const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupNode);

      const marker = new mapboxgl.Marker()
        .setLngLat([coords.lng, coords.lat])
        .setPopup(popup)
        .addTo(map.current);

      markers.current.push(marker);
    });
  }, [locations]);

  useEffect(() => {
    if (!map.current || !currentLocation) return;

    console.log('Setting current location:', currentLocation);

    try {
      const marker = new mapboxgl.Marker({ color: '#FF0000' })
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .addTo(map.current);

      markers.current.push(marker);

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
