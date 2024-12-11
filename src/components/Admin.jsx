import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuItem } from "./ui/dropdown-menu";
import LocationDetails from './LocationDetails';

function Admin() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('verified');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        console.log('Loaded locations:', data);
        setLocations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading locations:', err);
        setError('Failed to load locations');
        setLoading(false);
      });
  }, []);

  // Filter locations based on active tab and search term
  const filteredLocations = locations.filter(location => {
    const matchesTab = activeTab === 'verified' ? !location.isDraft : location.isDraft;
    const matchesSearch = searchTerm === '' || 
      (location.name && typeof location.name === 'string' && 
       location.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    if (selectedLocation && !filteredLocations.includes(selectedLocation)) {
      setSelectedLocation(null);
    }
  };

  const handleEditLocation = (location) => {
    console.log('Edit location:', location);
  };

  const handleVerifyLocation = (location) => {
    console.log('Verify location:', location);
  };

  const handleDeleteLocation = (location) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      console.log('Delete location:', location);
    }
  };

  const handleViewOnMap = (location) => {
    console.log('View on map:', location);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      Loading locations...
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen text-red-500">
      {error}
    </div>
  );

  const verifiedCount = locations.filter(l => !l.isDraft).length;
  const draftsCount = locations.filter(l => l.isDraft).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Historical Places Explorer Admin
            </h1>
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              onClick={() => console.log('Add new location')}
            >
              Add Location
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          <div className="w-1/3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center mb-4">
                  <CardTitle>Locations</CardTitle>
                  <span className="text-sm text-gray-500">
                    {filteredLocations.length} total
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Search locations..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full"
                    />
                  </div>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="verified" className="flex gap-2">
                        Verified
                        {verifiedCount > 0 && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                            {verifiedCount}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="drafts" className="flex gap-2">
                        Drafts
                        {draftsCount > 0 && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                            {draftsCount}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLocations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-gray-500 py-8">
                            {searchTerm ? 'No locations match your search' : 'No locations found'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLocations.map((location, index) => (
                          <TableRow 
                            key={location.id || index}
                            className={`cursor-pointer ${selectedLocation?.id === location.id ? 'bg-blue-50' : ''}`}
                            onClick={() => setSelectedLocation(location)}
                          >
                            <TableCell className="font-medium">
                              {typeof location.name === 'string' ? location.name : 'Unnamed Location'}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuItem onClick={() => handleEditLocation(location)}>
                                  Edit
                                </DropdownMenuItem>
                                
                                {location.isDraft && (
                                  <DropdownMenuItem onClick={() => handleVerifyLocation(location)}>
                                    Verify
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem onClick={() => handleViewOnMap(location)}>
                                  View on Map
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem 
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleDeleteLocation(location)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            {selectedLocation ? (
              <LocationDetails
                location={selectedLocation}
                onEdit={() => handleEditLocation(selectedLocation)}
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No location selected</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Select a location from the list to view its details
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Admin;