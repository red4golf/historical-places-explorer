# Historical Places Explorer

An interactive platform for exploring local history on Bainbridge Island, connecting physical locations with their historical significance.

## Features

- Interactive map display with historical locations
- Location-based storytelling
- Photo integration
- Draft submission system for new locations
- Admin interface for content management

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (comes with Node.js)
- A Mapbox API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Mapbox token in Map.jsx

4. Start the development server:
   ```bash
   npm start
   ```

This will start both the API server and the development server:
- API Server: http://localhost:3000
- Development Server: http://localhost:5173

### Building for Production

```bash
npm run build
```

## Project Structure

- `/content` - Historical location data and media
  - `/locations` - JSON files for location data
  - `/stories` - Markdown files for historical narratives
  - `/media` - Images and documents
- `/src` - Source code
  - `/components` - React components
  - `/api` - API route handlers
- `server.js` - Express server for API and static file serving

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on the development process and how to submit contributions.

## License

[MIT License](LICENSE)