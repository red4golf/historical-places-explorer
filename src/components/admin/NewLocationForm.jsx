import React, { useState } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { 
  generateLocationTemplate, 
  generateStoryMarkdown, 
  generateConnectionsTemplate 
} from '../../utils/templateGenerator';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Crosshair } from 'lucide-react';

const NewLocationForm = ({ onGenerate, className }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    lat: '',
    lng: '',
    author: ''
  });
  const [gpsStatus, setGpsStatus] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { getCurrentLocation } = useGeolocation();

  const getLocation = () => {
    setIsGettingLocation(true);
    setGpsStatus('Acquiring location...');
    getCurrentLocation()
      .then((coords) => {
        setFormData((prev) => ({
          ...prev,
          lat: coords.lat.toFixed(6),
          lng: coords.lng.toFixed(6)
        }));
        setGpsStatus('Location acquired!');
        setIsGettingLocation(false);
      })
      .catch((error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsStatus('Location permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsStatus('Location information unavailable');
            break;
          case error.TIMEOUT:
            setGpsStatus('Location request timed out');
            break;
          default:
            setGpsStatus('An unknown error occurred');
        }
        setIsGettingLocation(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert coordinates to numbers
    const coordinates = {
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng)
    };

    // Generate all three templates
    const location = generateLocationTemplate(
      formData.id,
      formData.name,
      coordinates
    );

    const story = generateStoryMarkdown(
      formData.name,
      formData.author,
      formData.id
    );

    const connections = generateConnectionsTemplate(formData.id);

    // Pass the generated templates to parent
    onGenerate?.({
      location,
      story,
      connections,
      paths: {
        location: `content/locations/${formData.id}.json`,
        story: `content/stories/${formData.id}.md`,
        connections: `content/stories/connections/${formData.id}.json`
      }
    });

    // Reset form
    setFormData({
      id: '',
      name: '',
      lat: '',
      lng: '',
      author: ''
    });
    setGpsStatus('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Add New Location</CardTitle>
        <CardDescription>
          Create templates for a new historical point of interest
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">Location ID</Label>
            <Input
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="e.g., port-blakely-mill"
              required
            />
            <p className="text-xs text-gray-500">
              Use lowercase letters, numbers, and hyphens only
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Location Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Port Blakely Mill Site"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Location Coordinates</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={getLocation}
                disabled={isGettingLocation}
                className="flex items-center gap-2"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Crosshair className="h-4 w-4" />
                )}
                Get Current Location
              </Button>
            </div>
            
            {gpsStatus && (
              <p className={`text-sm ${gpsStatus.includes('error') || gpsStatus.includes('denied') ? 'text-red-500' : 'text-blue-500'}`}>
                {gpsStatus}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  name="lat"
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={handleChange}
                  placeholder="e.g., 47.5934"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  name="lng"
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={handleChange}
                  placeholder="e.g., -122.5164"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Generate Templates
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewLocationForm;
