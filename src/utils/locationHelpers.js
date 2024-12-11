/**
 * Utility functions for location management
 */

// Convert location name to filename
export const generateLocationFilename = (location) => {
  const { name, tags = [], historicalPeriods = [] } = location;
  let filename = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Add type identifier if present
  const typeTag = tags.find(tag => 
    ['military', 'industry', 'natural', 'settlement', 'native', 'maritime'].includes(tag)
  );
  if (typeTag) {
    filename = `${filename}-${typeTag}`;
  }

  // Add year if available
  if (historicalPeriods.length > 0) {
    const year = historicalPeriods[0].split('-')[0];
    if (year && /^\d{4}$/.test(year)) {
      filename = `${filename}-${year}`;
    }
  }

  return `${filename}.json`;
};

// Validate coordinates are within Pacific Northwest bounds
export const validateCoordinates = (coordinates) => {
  const { lat, lng } = coordinates;
  const bounds = {
    north: 49.0,
    south: 42.0,
    west: -124.5,
    east: -116.5
  };

  return lat >= bounds.south && 
         lat <= bounds.north && 
         lng >= bounds.west && 
         lng <= bounds.east;
};

// Validate required fields
export const validateLocation = (location) => {
  const errors = {};

  if (!location.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!location.shortDescription?.trim()) {
    errors.shortDescription = 'Description is required';
  }

  if (!location.coordinates?.lat || !location.coordinates?.lng) {
    errors.coordinates = 'Valid coordinates are required';
  } else if (!validateCoordinates(location.coordinates)) {
    errors.coordinates = 'Coordinates must be within the Pacific Northwest region';
  }

  if (!location.historicalPeriods?.length) {
    errors.historicalPeriods = 'At least one historical period is required';
  }

  if (!location.tags?.length) {
    errors.tags = 'At least one tag is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Format dates consistently
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Prepare location data for saving
export const prepareLocationData = (formData, isDraft = false) => {
  return {
    ...formData,
    status: isDraft ? 'draft' : 'verified',
    updatedAt: new Date().toISOString(),
    verifiedAt: isDraft ? null : new Date().toISOString()
  };
};