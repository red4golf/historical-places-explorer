import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import AddLocationButton from './components/AddLocationButton';

function App() {
  const [locations, setLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        console.log('Loaded locations:', data);
        setLocations(data);
      })
      .catch(err => console.error('Failed to load locations:', err));
  }, []);

  const handleNewLocation = (location) => {
    console.log('New location added:', location);
    setLocations([...locations, location]);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('Got current location:', newLocation);
        setCurrentLocation(newLocation);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get location: ' + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="p-4 flex justify-between items-center bg-white shadow-sm z-10">
        <h1 className="text-xl font-bold">Historical Places Explorer</h1>
        <button
          onClick={getCurrentLocation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Get Location
        </button>
      </div>

      <div className="flex-1 relative w-full h-full">
        <Map 
          locations={locations} 
          currentLocation={currentLocation} 
        />
        <div className="absolute bottom-4 right-4 z-10">
          <AddLocationButton 
            onLocationAdded={handleNewLocation}
            setCurrentLocation={setCurrentLocation}
          />
        </div>
      </div>

      {currentLocation && (
        <div className="p-4 bg-white border-t z-10">
          <p className="font-bold">Latest Location:</p>
          <p>Lat: {currentLocation.lat.toFixed(6)}</p>
          <p>Lng: {currentLocation.lng.toFixed(6)}</p>
          <p>Time: {new Date().toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default App;