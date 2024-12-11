import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, 
  Calendar,
  Tag,
  Plus,
  X,
  AlertCircle,
  Save
} from 'lucide-react';
import { MediaUploader } from '../media/MediaUploader';

const LocationEditorModal = ({ location, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    location || {
      name: '',
      coordinates: { lat: '', lng: '' },
      shortDescription: '',
      historicalPeriods: [],
      tags: [],
      photos: []
    }
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Description is required';
    }

    const lat = parseFloat(formData.coordinates.lat);
    const lng = parseFloat(formData.coordinates.lng);

    if (isNaN(lat) || lat < 42.0 || lat > 49.0) {
      newErrors.lat = 'Latitude must be between 42.0 and 49.0';
    }

    if (isNaN(lng) || lng < -124.5 || lng > -116.5) {
      newErrors.lng = 'Longitude must be between -124.5 and -116.5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const method = location ? 'PUT' : 'POST';
      const url = location 
        ? `/api/locations/${location.id}`
        : '/api/locations';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save location');
      }

      onSave();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCoordinateSelect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
        },
        (error) => {
          setErrors({ coordinates: 'Failed to get location: ' + error.message });
        }
      );
    } else {
      setErrors({ coordinates: 'Geolocation is not supported' });
    }
  };

  const handlePeriodAdd = (period) => {
    if (!formData.historicalPeriods.includes(period)) {
      setFormData(prev => ({
        ...prev,
        historicalPeriods: [...prev.historicalPeriods, period]
      }));
    }
  };

  const handleTagAdd = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleMediaAdd = (files) => {
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {location ? 'Edit Location' : 'Add New Location'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ScrollArea className="h-[calc(90vh-200px)] pr-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  error={errors.name}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    shortDescription: e.target.value
                  }))}
                  rows={3}
                  error={errors.shortDescription}
                />
                {errors.shortDescription && (
                  <p className="text-sm text-red-500 mt-1">{errors.shortDescription}</p>
                )}
              </div>
            </div>

            {/* Coordinates */}
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <Label>Location Coordinates</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCoordinateSelect}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Current Location
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={formData.coordinates.lat}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coordinates: {
                        ...prev.coordinates,
                        lat: e.target.value
                      }
                    }))}
                    error={errors.lat}
                  />
                  {errors.lat && (
                    <p className="text-sm text-red-500 mt-1">{errors.lat}</p>
                  )}
                </div>
                <div>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={formData.coordinates.lng}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coordinates: {
                        ...prev.coordinates,
                        lng: e.target.value
                      }
                    }))}
                    error={errors.lng}
                  />
                  {errors.lng && (
                    <p className="text-sm text-red-500 mt-1">{errors.lng}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Historical Periods */}
            <div className="space-y-4 mt-6">
              <Label>Historical Periods</Label>
              <div className="flex flex-wrap gap-2">
                {formData.historicalPeriods.map((period, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        historicalPeriods: prev.historicalPeriods.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    {period}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePeriodAdd('1800s')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Period
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4 mt-6">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        tags: prev.tags.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    {tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTagAdd('historical')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Tag
                </Button>
              </div>
            </div>

            {/* Media Upload */}
            <div className="space-y-4 mt-6">
              <Label>Photos</Label>
              <div className="grid grid-cols-3 gap-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo.path}
                      alt={photo.caption || `Photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          photos: prev.photos.filter((_, i) => i !== index)
                        }));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <MediaUploader onMediaAdd={handleMediaAdd} />
              </div>
            </div>
          </ScrollArea>

          {/* Error Messages */}
          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Location'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LocationEditorModal;