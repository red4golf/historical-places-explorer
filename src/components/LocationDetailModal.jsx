import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, FileText, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { parseMarkdown } from '../utils/parseMarkdown';

const LocationDetailModal = ({ location, onClose }) => {
  const [story, setStory] = useState(null);
  const [storyError, setStoryError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storyMetadata, setStoryMetadata] = useState(null);

  useEffect(() => {
    if (location?.content?.stories?.[0]?.file) {
      loadStory(location.content.stories[0].file);
    }
  }, [location]);

  const loadStory = async (storyFile) => {
    try {
      setLoading(true);
      setStoryError(null);
      const response = await fetch(`/api/stories/${storyFile}`);
      if (response.ok) {
        const rawContent = await response.text();
        const { metadata, content } = parseMarkdown(rawContent);
        setStoryMetadata(metadata);
        setStory(content);
      } else {
        throw new Error('Failed to load story');
      }
    } catch (error) {
      console.error('Error loading story:', error);
      setStoryError('Unable to load the story at this time');
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
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
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
          {/* Story */}
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : storyError ? (
            <div className="text-red-600 py-2">{storyError}</div>
          ) : story ? (
            <div>
              {/* Story Metadata */}
              {storyMetadata && (
                <div className="mb-6">
                  {storyMetadata.title && (
                    <h1 className="text-2xl font-bold mb-2">{storyMetadata.title}</h1>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {storyMetadata.author && (
                      <div>By {storyMetadata.author}</div>
                    )}
                    {storyMetadata.date && (
                      <div>{new Date(storyMetadata.date).toLocaleDateString()}</div>
                    )}
                  </div>
                  {storyMetadata.tags && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {storyMetadata.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Story Content */}
              <div className="prose prose-sm md:prose-base lg:prose-lg mx-auto">
                <ReactMarkdown>{story}</ReactMarkdown>
              </div>
            </div>
          ) : null}

          {/* Rest of your existing content sections */}
          {/* ... */}
        </div>
      </div>
    </div>
  );
};

export default LocationDetailModal;