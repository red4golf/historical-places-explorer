/**
 * Handles media file uploads and management
 */
class MediaManager {
    static VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
    static VALID_DOCUMENT_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown'
    ];
    static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Upload a media file
     */
    static async uploadFile(file, type = 'image') {
        try {
            // Validate file
            this.validateFile(file, type);

            // Create FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);

            // Upload file
            const response = await fetch('/api/media/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }
    }

    /**
     * Validate file before upload
     */
    static validateFile(file, type) {
        // Check file size
        if (file.size > this.MAX_FILE_SIZE) {
            throw new Error('File size exceeds 5MB limit');
        }

        // Check file type
        if (type === 'image' && !this.VALID_IMAGE_TYPES.includes(file.type)) {
            throw new Error('Invalid image type. Use JPG, PNG, or GIF');
        }
        if (type === 'document' && !this.VALID_DOCUMENT_TYPES.includes(file.type)) {
            throw new Error('Invalid document type. Use PDF, DOC, DOCX, TXT, or MD');
        }
    }

    /**
     * Delete a media file
     */
    static async deleteFile(filename) {
        const response = await fetch(`/api/media/${filename}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Delete failed');
        }

        return response.json();
    }

    /**
     * Get URL for a media file
     */
    static getMediaUrl(filename) {
        return `/content/media/${filename}`;
    }

    /**
     * Generate a thumbnail for an image
     */
    static async generateThumbnail(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                reject(new Error('Not an image file'));
                return;
            }

            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                // Calculate thumbnail dimensions
                const maxSize = 200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw thumbnail
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob
                canvas.toBlob(
                    blob => resolve(blob),
                    'image/jpeg',
                    0.7
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));

            img.src = URL.createObjectURL(file);
        });
    }
}

export default MediaManager;