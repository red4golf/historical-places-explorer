import React, { useState, useEffect } from 'react';

const LocationManager = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/locations');
      if (!response.ok) throw new Error('Failed to load locations');
      const data = await response.json();
      setLocations(data);
      setError(null);
    } catch (err) {
      setError('Failed to load locations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading locations...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Verified Locations</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {locations.map(location => (
          <div key={location.id} className="border rounded-lg p-4">
            <h3 className="font-bold">
              {typeof location.name === 'string' ? location.name : location.name.current}
            </h3>
            <p className="text-gray-600 mt-1">
              {location.shortDescription || (location.content && location.content.summary)}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              Coordinates: {location.coordinates ? 
                `${location.coordinates.lat.toFixed(6)}, ${location.coordinates.lng.toFixed(6)}` :
                `${location.location.coordinates.lat.toFixed(6)}, ${location.location.coordinates.lng.toFixed(6)}`
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationManager;