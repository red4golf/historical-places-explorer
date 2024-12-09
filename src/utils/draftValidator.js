/**
 * Validates draft location submissions
 */
class DraftValidator {
    static validate(data) {
        const errors = [];

        // Required fields
        if (!data.name || data.name.trim() === '') {
            errors.push('Location name is required');
        }

        if (!data.coordinates) {
            errors.push('Coordinates are required');
        } else {
            if (typeof data.coordinates.lat !== 'number' || 
                typeof data.coordinates.lng !== 'number') {
                errors.push('Invalid coordinate format');
            }
            
            // Check if coordinates are within Bainbridge Island area
            const BAINBRIDGE_BOUNDS = {
                north: 47.7152,
                south: 47.5872,
                east: -122.4577,
                west: -122.5821
            };

            const { lat, lng } = data.coordinates;
            if (lat < BAINBRIDGE_BOUNDS.south || lat > BAINBRIDGE_BOUNDS.north ||
                lng < BAINBRIDGE_BOUNDS.west || lng > BAINBRIDGE_BOUNDS.east) {
                errors.push('Location must be within Bainbridge Island area');
            }
        }

        // Status validation
        if (data.status !== 'pending_review') {
            errors.push('Invalid status for draft submission');
        }

        // Basic content validation
        if (data.shortDescription && data.shortDescription.length > 500) {
            errors.push('Description must be 500 characters or less');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = DraftValidator;