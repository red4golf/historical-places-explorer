import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check, X, Clock, Link, MapPin } from 'lucide-react';

const DraftLocationsManager = () => {
  const [drafts, setDrafts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/locations/drafts');
      if (!response.ok) throw new Error('Failed to load draft locations');
      const data = await response.json();
      console.log('Loaded drafts:', data); // Debug log
      setDrafts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load drafts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (draft) => {
    try {
      // Format for approved location
      const approvedLocation = {
        id: draft.id,
        name: draft.name,
        coordinates: draft.coordinates,
        shortDescription: draft.shortDescription,
        historicalSignificance: draft.historicalSignificance,
        timePeriod: draft.timePeriod,
        sources: draft.sources || [],
        photos: draft.photos || [],
        relatedLocationIds: draft.relatedLocationIds || [],
        submittedAt: draft.submittedAt,
        approvedAt: new Date().toISOString()
      };

      // Save to main locations
      const saveResponse = await fetch(`/api/locations/${draft.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvedLocation)
      });

      if (!saveResponse.ok) throw new Error('Failed to save approved location');

      // Delete from drafts
      const deleteResponse = await fetch(`/api/locations/draft/${draft.id}`, {
        method: 'DELETE'
      });

      if (!deleteResponse.ok) throw new Error('Failed to delete draft');

      await loadDrafts();
    } catch (err) {
      setError('Failed to approve location: ' + err.message);
    }
  };

  const handleReject = async (draft) => {
    if (!window.confirm('Are you sure you want to reject this location?')) return;

    try {
      // Delete the draft
      const response = await fetch(`/api/locations/draft/${draft.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete draft');

      await loadDrafts();
    } catch (err) {
      setError('Failed to reject location: ' + err.message);
    }
  };

  if (loading) return (
    <div className="p-4 text-center">Loading draft locations...</div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Draft Locations</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {drafts.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No draft locations to review.
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div key={draft.id} className="border rounded-lg overflow-hidden bg-white shadow">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <div>
                  <h3 className="font-bold text-lg">{draft.name}</h3>
                  <p className="text-sm text-gray-600">
                    Submitted: {new Date(draft.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(draft)}
                    className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    title="Approve"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleReject(draft)}
                    className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    title="Reject"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === draft.id ? null : draft.id)}
                    className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {expandedId === draft.id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Expanded Content */}
              {expandedId === draft.id && (
                <div className="p-4 border-t">
                  {/* Location Info */}
                  <div className="mb-6 flex items-start gap-2">
                    <MapPin className="text-gray-400 mt-1" size={20} />
                    <div>
                      <h4 className="font-medium">Location</h4>
                      <p className="text-gray-600">
                        Lat: {draft.coordinates.lat.toFixed(6)}<br />
                        Lng: {draft.coordinates.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-600">{draft.shortDescription}</p>
                  </div>

                  {/* Historical Significance */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Historical Significance</h4>
                    <p className="text-gray-600">{draft.historicalSignificance}</p>
                  </div>

                  {/* Time Period */}
                  <div className="mb-6 flex items-start gap-2">
                    <Clock className="text-gray-400 mt-1" size={20} />
                    <div>
                      <h4 className="font-medium">Time Period</h4>
                      <p className="text-gray-600">{draft.timePeriod}</p>
                    </div>
                  </div>

                  {/* Photos */}
                  {draft.photos && draft.photos.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Photos</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {draft.photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={photo.path}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg shadow-sm"
                            />
                            {photo.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm rounded-b-lg">
                                {photo.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sources */}
                  {draft.sources && draft.sources.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Sources & References</h4>
                      <ul className="space-y-2">
                        {draft.sources.map((source, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Link className="text-gray-400" size={16} />
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
                              <span className="text-gray-600">{source}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Related Locations */}
                  {draft.relatedLocationIds && draft.relatedLocationIds.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Related Locations</h4>
                      <ul className="list-disc list-inside text-gray-600">
                        {draft.relatedLocationIds.map((id) => (
                          <li key={id}>{id}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Review Notes */}
                  {draft.reviewNotes && draft.reviewNotes.length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="font-medium mb-2">Review Notes</h4>
                      <ul className="space-y-2">
                        {draft.reviewNotes.map((note, index) => (
                          <li key={index} className="bg-gray-50 p-3 rounded">
                            <p className="text-gray-600">{note.text}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(note.timestamp).toLocaleString()}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraftLocationsManager;