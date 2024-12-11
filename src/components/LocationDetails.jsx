import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

function LocationDetails({ location, onEdit }) {
  if (!location) return null;

  // Helper functions
  const getLocationName = (location) => {
    if (typeof location.name === 'string') return location.name;
    if (location.name?.current) return location.name.current;
    if (location.name?.historical) return `${location.name.current} (${location.name.historical})`;
    return 'Unnamed Location';
  };

  const getCoordinates = (location) => {
    const coords = location.coordinates || location.location?.coordinates;
    if (!coords) return null;
    return {
      lat: coords.lat || coords.latitude,
      lng: coords.lng || coords.longitude
    };
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to parse tags
  const parseTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    // If it's a string, attempt to split it into separate tags
    if (typeof tags === 'string') {
      // Try to split on common separators (comma, space, semicolon)
      const separatedTags = tags.split(/[,;\s]+/);
      // Filter out empty strings and trim whitespace
      return separatedTags.filter(tag => tag.length > 0).map(tag => tag.trim());
    }
    return [];
  };

  const coordinates = getCoordinates(location);
  const tags = parseTags(location.tags);

  return (
    <div className="space-y-6">
      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle>{getLocationName(location)}</CardTitle>
              {location.shortDescription && (
                <p className="text-sm text-gray-500">{location.shortDescription}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {location.isDraft ? (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  Draft
                </span>
              ) : (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Verified
                </span>
              )}
              <button 
                onClick={onEdit}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            {location.createdAt && (
              <div className="space-y-1">
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">{formatDate(location.createdAt)}</dd>
              </div>
            )}
            {location.updatedAt && (
              <div className="space-y-1">
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="text-sm text-gray-900">{formatDate(location.updatedAt)}</dd>
              </div>
            )}
            {coordinates && (
              <div className="col-span-2 space-y-1">
                <dt className="text-sm font-medium text-gray-500">Coordinates</dt>
                <dd className="text-sm text-gray-900">
                  {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </dd>
              </div>
            )}
            {location.historicalName && (
              <div className="col-span-2 space-y-1">
                <dt className="text-sm font-medium text-gray-500">Historical Name</dt>
                <dd className="text-sm text-gray-900">{location.historicalName}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Historical Content Card */}
      {location.description && (
        <Card>
          <CardHeader>
            <CardTitle>Historical Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{location.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Tags Card */}
      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Card - Placeholder for future implementation */}
      {location.photos && location.photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {location.photos.length} photos associated with this location
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LocationDetails;