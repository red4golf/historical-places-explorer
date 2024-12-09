/**
 * Validates location data according to schema rules
 */
class LocationValidator {
    static validate(data) {
        const errors = [];

        // Required fields
        if (!this.validateRequired(data, errors)) {
            return { isValid: false, errors };
        }

        // Format validation
        this.validateFormats(data, errors);
        
        // Coordinate bounds (roughly Washington state)
        this.validateCoordinates(data, errors);

        // Media validation
        if (data.media) {
            this.validateMedia(data.media, errors);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static validateRequired(data, errors) {
        const required = {
            id: 'string',
            name: 'string',
            coordinates: 'object',
            shortDescription: 'string'
        };

        for (const [field, type] of Object.entries(required)) {
            if (!data[field]) {
                errors.push(`Missing required field: ${field}`);
                return false;
            }
            if (typeof data[field] !== type) {
                errors.push(`Invalid type for ${field}: expected ${type}`);
                return false;
            }
        }

        return true;
    }

    static validateFormats(data, errors) {
        // ID format (lowercase, hyphens only)
        if (!/^[a-z0-9-]+$/.test(data.id)) {
            errors.push('ID must contain only lowercase letters, numbers, and hyphens');
        }

        // Name length
        if (data.name.length > 100) {
            errors.push('Name must be 100 characters or less');
        }

        // Description length
        if (data.shortDescription.length > 500) {
            errors.push('Short description must be 500 characters or less');
        }

        // Historical periods format
        if (data.historicalPeriods) {
            for (const period of data.historicalPeriods) {
                if (!/^\d{4}(-\d{4})?$/.test(period)) {
                    errors.push(`Invalid historical period format: ${period}. Use YYYY or YYYY-YYYY`);
                }
            }
        }

        // Tags format
        if (data.tags) {
            if (!Array.isArray(data.tags)) {
                errors.push('Tags must be an array');
            } else {
                for (const tag of data.tags) {
                    if (!/^[a-z0-9-]+$/.test(tag)) {
                        errors.push(`Invalid tag format: ${tag}. Use lowercase letters, numbers, and hyphens`);
                    }
                }
            }
        }
    }

    static validateCoordinates(data, errors) {
        const { lat, lng } = data.coordinates;
        
        // Washington state bounds (roughly)
        if (lat < 45.5 || lat > 49.0) {
            errors.push('Latitude must be within Washington state bounds (45.5°N to 49.0°N)');
        }
        if (lng < -124.8 || lng > -116.9) {
            errors.push('Longitude must be within Washington state bounds (124.8°W to 116.9°W)');
        }
    }

    static validateMedia(media, errors) {
        if (media.images) {
            if (!Array.isArray(media.images)) {
                errors.push('Media images must be an array');
            } else {
                media.images.forEach((image, index) => {
                    if (!image.filename) {
                        errors.push(`Image ${index + 1} missing filename`);
                    }
                    if (!image.caption) {
                        errors.push(`Image ${index + 1} missing caption`);
                    }
                    if (!this.isValidImageFilename(image.filename)) {
                        errors.push(`Invalid image filename: ${image.filename}`);
                    }
                });
            }
        }

        if (media.documents) {
            if (!Array.isArray(media.documents)) {
                errors.push('Media documents must be an array');
            } else {
                media.documents.forEach((doc, index) => {
                    if (!doc.filename) {
                        errors.push(`Document ${index + 1} missing filename`);
                    }
                    if (!doc.description) {
                        errors.push(`Document ${index + 1} missing description`);
                    }
                    if (!this.isValidDocumentFilename(doc.filename)) {
                        errors.push(`Invalid document filename: ${doc.filename}`);
                    }
                });
            }
        }
    }

    static isValidImageFilename(filename) {
        return /\.(jpg|jpeg|png|gif)$/i.test(filename);
    }

    static isValidDocumentFilename(filename) {
        return /\.(pdf|doc|docx|txt|md)$/i.test(filename);
    }
}

export default LocationValidator;