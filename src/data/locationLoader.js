/**
 * Loads and normalizes historical location data
 */
class LocationLoader {
    /**
     * Normalize location data into a consistent format
     */
    static normalizeLocation(rawData) {
        try {
            // Handle different coordinate formats
            const coordinates = rawData.coordinates || 
                              (rawData.location && rawData.location.coordinates);
            
            if (!coordinates || !coordinates.lat || !coordinates.lng) {
                throw new Error(`Invalid coordinates in location: ${rawData.id}`);
            }

            // Handle different name formats
            const name = typeof rawData.name === 'string' ? 
                        rawData.name : 
                        (rawData.name?.current || rawData.name?.historical?.[0]);

            if (!name) {
                throw new Error(`Invalid name in location: ${rawData.id}`);
            }

            // Handle different description formats
            const description = rawData.shortDescription || 
                              rawData.content?.summary;

            if (!description) {
                throw new Error(`Missing description in location: ${rawData.id}`);
            }

            // Get time period
            const period = rawData.historicalPeriods?.[0] || 
                          rawData.timeframes?.[0]?.period;

            return {
                id: rawData.id,
                name: name,
                coordinates: {
                    lat: coordinates.lat,
                    lng: coordinates.lng
                },
                description: description,
                period: period,
                stories: this.normalizeStories(rawData),
                media: this.normalizeMedia(rawData)
            };
        } catch (error) {
            console.error(`Error normalizing location data:`, error);
            throw error;
        }
    }

    /**
     * Normalize stories data
     */
    static normalizeStories(rawData) {
        const stories = [];
        
        // Handle simple story arrays
        if (rawData.stories && Array.isArray(rawData.stories)) {
            stories.push(...rawData.stories);
        }
        
        // Handle detailed story objects
        if (rawData.content?.stories && Array.isArray(rawData.content.stories)) {
            stories.push(...rawData.content.stories.map(story => story.file));
        }
        
        return stories;
    }

    /**
     * Normalize media data
     */
    static normalizeMedia(rawData) {
        const media = { images: [], documents: [] };

        // Handle direct media object
        if (rawData.media) {
            if (rawData.media.images) media.images = rawData.media.images;
            if (rawData.media.documents) media.documents = rawData.media.documents;
        }

        return media;
    }

    /**
     * Load a single location file
     */
    static async loadLocation(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load location: ${path}`);
            }
            const data = await response.json();
            return this.normalizeLocation(data);
        } catch (error) {
            console.error(`Error loading location from ${path}:`, error);
            throw error;
        }
    }

    /**
     * Load all locations from a directory
     */
    static async loadAllLocations(paths) {
        const locations = [];
        const errors = [];

        for (const path of paths) {
            try {
                const location = await this.loadLocation(path);
                locations.push(location);
            } catch (error) {
                errors.push({ path, error: error.message });
            }
        }

        // Report any errors but don't fail completely
        if (errors.length > 0) {
            console.warn('Some locations failed to load:', errors);
        }

        return locations;
    }
}

export default LocationLoader;