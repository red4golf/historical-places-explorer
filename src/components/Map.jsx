import React from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { useLocation } from '../contexts/LocationContext';
import 'mapbox-gl/dist/mapbox-gl.css';

function MapView() {
  const [viewport, setViewport] = React.useState({
    latitude: 47.6262,
    longitude: -122.5212,
    zoom: 11
  });

  const { locations, selectedLocation, setSelectedLocation } = useLocation();

  return (
    <Map
      {...viewport}
      onMove={evt => setViewport(evt.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/outdoors-v12"
      mapboxAccessToken={process.env.VITE_MAPBOX_TOKEN}
    >
      {locations.map(location => (
        <Marker
          key={location.id}
          latitude={location.coordinates.lat}
          longitude={location.coordinates.lng}
          onClick={() => setSelectedLocation(location)}
        >
          <div className="cursor-pointer">
            <Pin />
          </div>
        </Marker>
      ))}

      {selectedLocation && (
        <Popup
          latitude={selectedLocation.coordinates.lat}
          longitude={selectedLocation.coordinates.lng}
          onClose={() => setSelectedLocation(null)}
          closeButton={true}
          closeOnClick={false}
          offsetTop={-30}
        >
          <div className="p-2">
            <h3 className="font-bold">{selectedLocation.name}</h3>
            <p className="text-sm">{selectedLocation.shortDescription}</p>
          </div>
        </Popup>
      )}
    </Map>
  );
}

function Pin() {
  return (
    <svg
      className="w-6 h-6 text-blue-500"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path fillRule="evenodd" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    </svg>
  );
}

export default MapView;