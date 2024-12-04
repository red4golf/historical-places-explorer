import React, { useState, useRef, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  Maximize2,
  MinimizeIcon, 
  ArrowLeft, 
  ArrowRight 
} from 'lucide-react';

const MediaComparison = ({ 
  historicalMedia,
  currentMedia,
  title,
  description,
  metadata,
  comparisonType = "slider" // or "sideBySide"
}) => {
  const [comparisonMode, setComparisonMode] = useState(comparisonType);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle slider movement
  const handleSliderChange = (value) => {
    setSliderPosition(value[0]);
  };

  // Render comparison view based on mode
  const ComparisonView = () => {
    if (comparisonMode === "slider") {
      return (
        <div className="relative w-full h-96 overflow-hidden">
          {/* Historical Image */}
          <img
            src={historicalMedia.path}
            alt={historicalMedia.caption || "Historical view"}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
          {/* Current Image with Clip Path */}
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`
            }}
          >
            <img
              src={currentMedia.path}
              alt={currentMedia.caption || "Current view"}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Slider Line */}
          <div
            className="absolute top-0 w-1 h-full bg-white cursor-ew-resize"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex gap-1">
              <ArrowLeft className="w-4 h-4" />
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col md:flex-row gap-4 w-full h-96">
        <div className="flex-1 relative">
          <img
            src={historicalMedia.path}
            alt={historicalMedia.caption || "Historical view"}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
            {metadata?.date?.historical || "Historical"}
          </span>
        </div>
        <div className="flex-1 relative">
          <img
            src={currentMedia.path}
            alt={currentMedia.caption || "Current view"}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
            {metadata?.date?.current || "Current"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full" ref={containerRef}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select
              value={comparisonMode}
              onValueChange={setComparisonMode}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Compare mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slider">Slider</SelectItem>
                <SelectItem value="sideBySide">Side by Side</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 rounded"
            >
              {isFullscreen ? (
                <MinimizeIcon className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ComparisonView />
        
        {comparisonMode === "slider" && (
          <div className="mt-4 px-4">
            <Slider
              defaultValue={[50]}
              max={100}
              step={1}
              value={[sliderPosition]}
              onValueChange={handleSliderChange}
              className="w-full"
            />
          </div>
        )}
        
        {metadata && (
          <div className="mt-4 text-sm text-gray-500">
            <p className="font-medium">Details:</p>
            <p>Historical: {metadata.date?.historical}</p>
            <p>Current: {metadata.date?.current}</p>
            {metadata.source && (
              <p className="mt-2 text-xs">
                Source: {metadata.source.citation}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaComparison;