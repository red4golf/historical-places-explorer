# Historical Places Explorer - Quick Start Guide

## Setup Instructions

1. Install Dependencies
```bash
npm install
```

2. Set up Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

3. Create Required Directories
```bash
mkdir -p content/locations/drafts
mkdir -p content/media/images
mkdir -p content/stories
```

4. Start Development Server
```bash
npm run dev
```

5. Access the Application
- Main application: http://localhost:3000
- Admin interface: http://localhost:3000/admin.html

## Admin Interface Usage

### Managing Locations

1. View Locations
- Switch between verified and draft locations using tabs
- Use search and filters to find specific locations
- Click on a location to view details

2. Adding New Locations
- Click "Add New Location" button
- Fill in required information
- Add photos (optional)
- Save as draft or publish directly

3. Verifying Draft Locations
- Select a draft location
- Review all information
- Complete verification checklist
- Approve or reject the location

4. Managing Media
- Drag and drop images or use file picker
- Add captions to images
- Images are automatically optimized
- Maximum file size: 5MB per image

### File Structure

```
content/
├── locations/      # Location JSON files
│   └── drafts/    # Draft locations
├── media/         # Media files
│   └── images/    # Uploaded images
└── stories/       # Markdown story files
```

### Common Tasks

1. Edit Existing Location
- Select location from list
- Click "Edit" button
- Update information
- Save changes

2. Add New Story
- Select related location
- Click "Add Story"
- Write content in markdown
- Link to location

3. Manage Media
- Upload through media manager
- Add captions
- Link to locations
- Remove unused media

## Troubleshooting

1. Media Upload Issues
- Check file size (max 5MB)
- Verify file type (images only)
- Ensure proper permissions on media directory

2. Location Not Showing
- Verify JSON format
- Check coordinates are within bounds
- Ensure all required fields are present

3. Story Not Linking
- Check filename references
- Verify markdown formatting
- Ensure proper frontmatter

## Need Help?

- Check the full documentation in /docs
- Review error messages in the console
- Verify all environment variables are set

Remember to refresh the page after making file system changes if they're not appearing.