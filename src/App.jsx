import React, { useState, useEffect, Suspense } from 'react';
const Map = React.lazy(() => import('./components/Map'));
import AddLocationButton from './components/AddLocationButton';
import { useGeolocation } from './hooks/useGeolocation';

function App() {
  const [locations, setLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const { getCurrentLocation } = useGeolocation();

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

  const handleGetLocation = () => {
    getCurrentLocation()
      .then((loc) => {
        console.log('Got current location:', loc);
        setCurrentLocation(loc);
      })
      .catch((error) => {
        console.error('Error getting location:', error);
        alert('Unable to get location: ' + error.message);
      });
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="p-4 flex justify-between items-center bg-white shadow-sm z-10">
        <h1 className="text-xl font-bold">Historical Places Explorer</h1>
        <button
          onClick={handleGetLocation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Get Location
        </button>
      </div>

      <div className="flex-1 relative w-full h-full">
        <Suspense fallback={<div>Loading map...</div>}>
          <Map locations={locations} currentLocation={currentLocation} />
        </Suspense>
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