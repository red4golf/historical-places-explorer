import React from 'react'
import Map from './components/Map'
import Sidebar from './components/Sidebar'
import { LocationProvider } from './contexts/LocationContext'

function App() {
  return (
    <LocationProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1">
          <Map />
        </main>
      </div>
    </LocationProvider>
  )
}

export default App