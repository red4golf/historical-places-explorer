import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  CheckCircle, 
  AlertCircle, 
  MapPin,
  Calendar,
  FileText,
  Image,
  Tag
} from 'lucide-react';

const VerificationStep = ({ 
  title, 
  icon: Icon,
  description, 
  checked, 
  onCheck, 
  valid, 
  items 
}) => (
  <Card className="mb-4">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex gap-2">
          <Icon className="h-5 w-5 text-gray-400" />
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <Checkbox
          checked={checked}
          onCheckedChange={onCheck}
          disabled={!valid}
        />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm font-medium">{item.label}</span>
            <span className="text-sm text-gray-500">{item.value}</span>
          </div>
        ))}
      </div>
    </CardContent>
    {!valid && (
      <CardFooter>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some items need attention before this step can be completed
          </AlertDescription>
        </Alert>
      </CardFooter>
    )}
  </Card>
);

const LocationVerificationWorkflow = ({ location, onClose, onVerify }) => {
  const [verificationSteps, setVerificationSteps] = useState({
    requiredFields: false,
    coordinates: false,
    content: false,
    media: true,
    tags: false
  });
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);

  const validateRequiredFields = () => {
    return (
      location.name?.trim() &&
      location.shortDescription?.trim() &&
      location.historicalPeriods?.length > 0
    );
  };

  const validateCoordinates = () => {
    const { lat, lng } = location.coordinates;
    return (
      lat >= 42.0 && lat <= 49.0 &&
      lng >= -124.5 && lng <= -116.5
    );
  };

  const validateContent = () => {
    return true; // Content is optional
  };

  const validateTags = () => {
    return location.tags?.length > 0;
  };

  const handleVerification = async () => {
    try {
      setVerifying(true);
      setError(null);

      const response = await fetch(`/api/locations/verify/${location.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(location)
      });

      if (!response.ok) {
        throw new Error('Failed to verify location');
      }

      onVerify();
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const isReadyToVerify = Object.values(verificationSteps).every(step => step);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Verify Location: {location.name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[600px] p-4">
          {/* Required Fields Check */}
          <VerificationStep
            title="Required Fields"
            icon={FileText}
            description="Check all required fields are present and valid"
            checked={verificationSteps.requiredFields}
            onCheck={() => setVerificationSteps(prev => ({
              ...prev,
              requiredFields: validateRequiredFields()
            }))}
            valid={validateRequiredFields()}
            items={[
              { label: 'Name', value: location.name },
              { label: 'Description', value: location.shortDescription },
              { label: 'Historical Periods', value: location.historicalPeriods?.join(', ') || 'None' }
            ]}
          />

          {/* Coordinates Check */}
          <VerificationStep
            title="Location Coordinates"
            icon={MapPin}
            description="Verify coordinates are within the Pacific Northwest region"
            checked={verificationSteps.coordinates}
            onCheck={() => setVerificationSteps(prev => ({
              ...prev,
              coordinates: validateCoordinates()
            }))}
            valid={validateCoordinates()}
            items={[
              { 
                label: 'Coordinates', 
                value: `${location.coordinates.lat.toFixed(6)}, ${location.coordinates.lng.toFixed(6)}` 
              }
            ]}
          />

          {/* Content Check */}
          <VerificationStep
            title="Content Verification"
            icon={FileText}
            description="Verify associated content and stories"
            checked={verificationSteps.content}
            onCheck={() => setVerificationSteps(prev => ({
              ...prev,
              content: validateContent()
            }))}
            valid={validateContent()}
            items={[
              { 
                label: 'Stories', 
                value: location.content?.stories?.length 
                  ? `${location.content.stories.length} stories attached` 
                  : 'No stories attached'
              }
            ]}
          />

          {/* Media Check */}
          <VerificationStep
            title="Media Files"
            icon={Image}
            description="Check attached media files (optional)"
            checked={verificationSteps.media}
            onCheck={() => setVerificationSteps(prev => ({
              ...prev,
              media: true
            }))}
            valid={true}
            items={[
              { 
                label: 'Photos', 
                value: location.photos?.length 
                  ? `${location.photos.length} photos attached` 
                  : 'No photos attached'
              }
            ]}
          />

          {/* Tags Check */}
          <VerificationStep
            title="Tags and Categories"
            icon={Tag}
            description="Verify location tags and categories"
            checked={verificationSteps.tags}
            onCheck={() => setVerificationSteps(prev => ({
              ...prev,
              tags: validateTags()
            }))}
            valid={validateTags()}
            items={[
              { 
                label: 'Tags', 
                value: location.tags?.join(', ') || 'No tags added'
              }
            ]}
          />
        </ScrollArea>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleVerification}
            disabled={!isReadyToVerify || verifying}
          >
            {verifying ? (
              'Verifying...'
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Location
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationVerificationWorkflow;