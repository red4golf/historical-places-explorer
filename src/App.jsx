import React, { useState } from 'react';
import Map from './components/Map';

function App() {
  const [locations, setLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Simple GPS capture
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString()
        };
        setCurrentLocation(newLocation);
        setLocations([...locations, newLocation]);
      },
      (error) => {
        alert('Unable to get location: ' + error.message);
      }
    );
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 flex justify-between items-center bg-white shadow-sm">
        <h1 className="text-xl font-bold">Historical Places Explorer</h1>
        <button 
          onClick={getLocation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Capture Location
        </button>
      </div>

      <div className="flex-1">
        <Map locations={locations} currentLocation={currentLocation} />
      </div>

      {currentLocation && (
        <div className="p-4 bg-white border-t">
          <p>Latest Capture:</p>
          <p>Lat: {currentLocation.lat.toFixed(6)}</p>
          <p>Lng: {currentLocation.lng.toFixed(6)}</p>
          <p>Time: {new Date(currentLocation.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default App;