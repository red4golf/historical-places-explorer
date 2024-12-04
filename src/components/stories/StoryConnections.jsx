import React, { useState } from 'react';
import { MapPin, Clock, BookOpen, Tag } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const StoryConnections = ({ 
  connections,
  onLocationClick,
  onStoryClick,
  onPeriodClick 
}) => {
  const { locations, timePeriods, relatedStories, themes } = connections;
  
  // Function to format date ranges nicely
  const formatPeriod = (period) => {
    return period.split('-').join(' - ');
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Story Connections</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="locations">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Related
            </TabsTrigger>
            <TabsTrigger value="themes" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Themes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="locations" className="mt-4">
            <div className="space-y-4">
              {locations.map(location => (
                <div 
                  key={location.id}
                  className="p-4 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  onClick={() => onLocationClick?.(location)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{location.id.split('-').join(' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                      <p className="text-sm text-gray-500 capitalize">{location.relationship} Location</p>
                    </div>
                    <MapPin className="w-5 h-5 text-blue-500" />
                  </div>
                  {location.relevantFeatures && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Key Features:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {location.relevantFeatures.map(feature => (
                          <span 
                            key={feature}
                            className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                          >
                            {feature.split('-').join(' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <div className="space-y-6">
              {timePeriods.map((period, index) => (
                <div 
                  key={period.period}
                  className="relative"
                  onClick={() => onPeriodClick?.(period)}
                >
                  {index !== 0 && (
                    <div className="absolute top-0 left-3 -bottom-6 w-0.5 bg-gray-200" />
                  )}
                  <div className="relative flex items-start gap-4 hover:bg-gray-50 p-4 rounded-lg cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 z-10">
                      <span className="w-3 h-3 bg-white rounded-full" />
                    </div>
                    <div>
                      <h3 className="font-medium">{formatPeriod(period.period)}</h3>
                      <p className="text-sm text-gray-500 capitalize">{period.importance} Period</p>
                      {period.events && (
                        <div className="mt-2 space-y-2">
                          {period.events.map(event => (
                            <div key={event.date} className="text-sm">
                              <span className="font-medium">{event.date}:</span> {event.description}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stories" className="mt-4">
            <div className="space-y-4">
              {relatedStories.map(story => (
                <div 
                  key={story.id}
                  className="p-4 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  onClick={() => onStoryClick?.(story)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{story.id.split('-').join(' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                      <p className="text-sm text-gray-500 capitalize">{story.connection} Story</p>
                    </div>
                    <BookOpen className="w-5 h-5 text-blue-500" />
                  </div>
                  {story.description && (
                    <p className="mt-2 text-sm text-gray-600">{story.description}</p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="themes" className="mt-4">
            <div className="flex flex-wrap gap-2">
              {themes.map(theme => (
                <span
                  key={theme}
                  className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 cursor-pointer"
                >
                  {theme}
                </span>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StoryConnections;