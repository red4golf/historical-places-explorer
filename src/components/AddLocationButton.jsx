import React, { useState, useEffect } from 'react';
import { MapPinIcon, Upload, X } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';

const TIME_PERIODS = [
  "Pre-1850",
  "1850-1870",
  "1871-1890",
  "1891-1910",
  "1911-1930",
  "1931-1950",
  "1951-1970",
  "Post-1970"
];

const AddLocationButton = ({ onLocationAdded, setCurrentLocation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState(null);
  const [existingLocations, setExistingLocations] = useState([]);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [significance, setSignificance] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [sources, setSources] = useState('');
  const [relatedLocations, setRelatedLocations] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { getCurrentLocation } = useGeolocation();

  // Load existing locations for relationships
  useEffect(() => {
    if (isOpen) {
      fetch('/api/locations')
        .then(res => res.json())
        .then(data => setExistingLocations(data))
        .catch(err => console.error('Failed to load existing locations:', err));
    }
  }, [isOpen]);

  const getLocation = () => {
    setIsLoading(true);
    setError('');
    getCurrentLocation()
      .then((newLocation) => {
        setLocation(newLocation);
        setCurrentLocation(newLocation);
        setIsLoading(false);
      })
      .catch((err) => {
        setError('Unable to get location: ' + err.message);
        setIsLoading(false);
      });
  };

  const handlePhotoSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Photos must be images under 5MB.');
    }

    setPhotos(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPhotoUrls(prev => [...prev, url]);
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(photoUrls[index]);
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async () => {
    const uploadedPhotos = [];
    setUploadProgress(0);

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const formData = new FormData();
      formData.append('file', photo);
      formData.append('type', 'image');

      try {
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Failed to upload photo');

        const result = await response.json();
        uploadedPhotos.push({
          filename: result.filename,
          path: result.path,
          caption: ''
        });

        setUploadProgress((i + 1) / photos.length * 100);
      } catch (error) {
        console.error('Error uploading photo:', error);
        setError(`Failed to upload ${photo.name}`);
      }
    }

    return uploadedPhotos;
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Upload photos first
      const uploadedPhotos = photos.length > 0 ? await uploadPhotos() : [];

      // Format sources into array
      const sourcesList = sources
        .split('\n')
        .map(s => s.trim())
        .filter(s => s);

      const locationData = {
        name: name,
        shortDescription: description,
        historicalSignificance: significance,
        coordinates: location,
        timePeriod: timePeriod,
        sources: sourcesList,
        relatedLocationIds: relatedLocations,
        photos: uploadedPhotos,
        status: 'pending_review',
        submittedAt: new Date().toISOString(),
        id: `loc_${Date.now()}`
      };

      const response = await fetch('/api/locations/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData)
      });

      if (!response.ok) throw new Error('Failed to save location');

      // Clean up photo URLs
      photoUrls.forEach(url => URL.revokeObjectURL(url));

      // Reset form
      setName('');
      setDescription('');
      setSignificance('');
      setTimePeriod('');
      setSources('');
      setRelatedLocations([]);
      setPhotos([]);
      setPhotoUrls([]);
      setLocation(null);
      setIsOpen(false);
      setUploadProgress(0);

      // Call the callback
      onLocationAdded(locationData);

      // Show success message
      alert('Location submitted for review');
    } catch (error) {
      setError('Failed to save location: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => {
          setIsOpen(true);
          getLocation();
        }}
        className="fixed bottom-4 right-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <MapPinIcon className="h-4 w-4" />
        Add Location
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-auto my-8">
            <h2 className="text-xl font-bold mb-4">Add Historical Location</h2>
            <p className="text-gray-600 mb-4">
              Suggest a new historical location. Your current GPS coordinates will be used.
            </p>

            {error && (
              <div className="text-red-500 text-sm mb-4">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-4">
                {uploadProgress > 0 ? (
                  <div>
                    <p>Uploading photos... {Math.round(uploadProgress)}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  'Getting your location...'
                )}
              </div>
            ) : location ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Old Mill Site"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Brief Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the location..."
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Historical Significance</label>
                  <textarea
                    value={significance}
                    onChange={(e) => setSignificance(e.target.value)}
                    placeholder="Why is this location historically significant?"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select a time period...</option>
                    {TIME_PERIODS.map(period => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Photos</label>
                  <div className="border-2 border-dashed rounded-md p-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoSelect}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label 
                      htmlFor="photo-upload"
                      className="flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload size={20} />
                      <span>Upload Photos (max 5MB each)</span>
                    </label>
                  </div>
                  {photoUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {photoUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={url} 
                            alt={`Upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sources & References</label>
                  <textarea
                    value={sources}
                    onChange={(e) => setSources(e.target.value)}
                    placeholder="Add URLs or references (one per line)"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Related Locations</label>
                  <select
                    multiple
                    value={relatedLocations}
                    onChange={(e) => setRelatedLocations(
                      Array.from(e.target.selectedOptions, option => option.value)
                    )}
                    className="w-full px-3 py-2 border rounded-md"
                    size={3}
                  >
                    {existingLocations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {typeof loc.name === 'string' ? loc.name : loc.name.current}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">
                    Hold Ctrl/Cmd to select multiple locations
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  photoUrls.forEach(url => URL.revokeObjectURL(url));
                  setIsOpen(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!location || !name.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit for Review
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddLocationButton;
