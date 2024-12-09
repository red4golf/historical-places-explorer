import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, FileText } from 'lucide-react';

const LocationDetailModal = ({ location, onClose }) => {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location?.content?.stories?.[0]?.file) {
      loadStory(location.content.stories[0].file);
    }
  }, [location]);

  const loadStory = async (storyFile) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stories/${storyFile}`);
      if (response.ok) {
        const content = await response.text();
        setStory(content);
      }
    } catch (error) {
      console.error('Error loading story:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!location) return null;

  const getLocationName = () => {
    return typeof location.name === 'string' ? location.name : location.name.current;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{getLocationName()}</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Location Info */}
          <div className="flex items-start gap-2">
            <MapPin className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-gray-600">
                Lat: {location.coordinates ? location.coordinates.lat.toFixed(6) : location.location.coordinates.lat.toFixed(6)}<br />
                Lng: {location.coordinates ? location.coordinates.lng.toFixed(6) : location.location.coordinates.lng.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-600">
              {location.shortDescription || location.content?.summary}
            </p>
          </div>

          {/* Historical Period */}
          {(location.timePeriod || location.historicalPeriods?.[0]) && (
            <div className="flex items-start gap-2">
              <Clock className="text-gray-400 mt-1" size={20} />
              <p className="text-gray-600">
                {location.timePeriod || location.historicalPeriods[0]}
              </p>
            </div>
          )}

          {/* Photos */}
          {location.photos && location.photos.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Photos</h3>
              <div className="grid grid-cols-2 gap-4">
                {location.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo.path}
                      alt={photo.caption || `Photo ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Story */}
          {story && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-gray-400" size={20} />
                <h3 className="font-medium">Story</h3>
              </div>
              <div className="prose max-w-none">
                {story}
              </div>
            </div>
          )}

          {/* Sources */}
          {location.sources && location.sources.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Sources & References</h3>
              <ul className="list-disc list-inside text-gray-600">
                {location.sources.map((source, index) => (
                  <li key={index}>
                    {source.startsWith('http') ? (
                      <a 
                        href={source} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {source}
                      </a>
                    ) : (
                      source
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationDetailModal;