import React from 'react';
import { useLocation } from '../contexts/LocationContext';
import { Search } from 'lucide-react';

function Sidebar() {
  const { locations, selectedLocation, setSelectedLocation } = useLocation();

  return (
    <div className="w-96 bg-white border-r h-screen overflow-auto">
      {/* Search Header */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search locations..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Location List */}
      <div className="p-4">
        {locations.map(location => (
          <div
            key={location.id}
            className={`p-4 rounded-lg mb-3 cursor-pointer ${
              selectedLocation?.id === location.id
                ? 'bg-blue-50 border-blue-200'
                : 'hover:bg-gray-50 border-gray-100'
            } border`}
            onClick={() => setSelectedLocation(location)}
          >
            <h3 className="font-bold">{location.name}</h3>
            <p className="text-sm text-gray-600">{location.shortDescription}</p>
            <div className="flex gap-2 mt-2">
              {location.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;