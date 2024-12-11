import React, { useState, useEffect } from "react";
import { X, Clock, MapPin, FileText, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";

const LocationDetailModal = ({ location, onClose }) => {
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('LocationDetailModal mounted with location:', location);
    if (location?.content?.stories?.[0]) {
      loadStory(location.content.stories[0].file);
    } else {
      setLoading(false);
    }
  }, [location]);

  const loadStory = async (filename) => {
    try {
      console.log('Loading story:', filename);
      setLoading(true);
      const response = await fetch(`/api/stories/${filename}`);
      console.log('Story response:', response);
      
      if (!response.ok) throw new Error('Failed to load story');
      
      const text = await response.text();
      console.log('Story content:', text);
      setStory(text);
      setError(null);
    } catch (err) {
      console.error('Error loading story:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  console.log('Current modal state:', { loading, error, hasStory: !!story });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">{location.name}</h2>
            <p className="text-gray-600 mt-2">{location.shortDescription}</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <h3 className="font-medium">Location</h3>
                <p className="text-gray-600">
                  {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
                </p>
              </div>
            </div>

            {location.historicalPeriods && (
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <h3 className="font-medium">Historical Period</h3>
                  <p className="text-gray-600">
                    {location.historicalPeriods.join(', ')}
                  </p>
                </div>
              </div>
            )}

            {location.tags && location.tags.length > 0 && (
              <div className="flex items-start gap-2">
                <Tag className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <h3 className="font-medium">Tags</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {location.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {location.content?.stories?.length > 0 && (
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium">Story</h3>
                  {loading ? (
                    <p className="text-gray-600">Loading story...</p>
                  ) : error ? (
                    <p className="text-red-600">{error}</p>
                  ) : (
                    <div className="prose max-w-none mt-2">
                      <ReactMarkdown>{story}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            )}

            {location.photos && location.photos.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Photos</h3>
                <div className="grid grid-cols-2 gap-4">
                  {location.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.path}
                        alt={photo.caption || `Photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded"
                      />
                      {photo.caption && (
                        <p className="text-sm text-gray-600 mt-1">{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailModal;