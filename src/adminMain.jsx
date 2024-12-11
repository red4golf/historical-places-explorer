import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const AdminPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Historical Places Admin</h1>
      <p className="mt-2">Welcome to the admin interface.</p>
    </div>
  )
}

// Make sure the DOM is loaded before rendering
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root')
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <AdminPage />
      </React.StrictMode>
    )
  } else {
    console.error('Root element not found')
  }
})