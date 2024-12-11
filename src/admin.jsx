import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function AdminPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Historical Places Admin</h1>
      <p className="mt-2">Welcome to the admin interface.</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminPage />
  </React.StrictMode>,
)