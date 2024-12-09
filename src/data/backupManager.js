/**
 * Handles backup and restoration of location data
 */
class BackupManager {
    /**
     * Create a backup of all location data
     */
    static async createBackup() {
        try {
            const response = await fetch('/api/locations');
            if (!response.ok) throw new Error('Failed to load locations');
            
            const locations = await response.json();
            const backup = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                locations
            };

            // Create Blob and download
            const blob = new Blob([JSON.stringify(backup, null, 2)], {
                type: 'application/json'
            });
            
            const filename = `historical-places-backup-${backup.timestamp.split('T')[0]}.json`;
            
            // Create download link
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);

            return { success: true, message: 'Backup created successfully' };
        } catch (error) {
            return { 
                success: false, 
                error: `Failed to create backup: ${error.message}` 
            };
        }
    }

    /**
     * Restore from a backup file
     */
    static async restoreFromFile(file) {
        try {
            const backup = await this.readBackupFile(file);
            
            // Validate backup format
            if (!this.isValidBackup(backup)) {
                throw new Error('Invalid backup file format');
            }

            // Restore each location
            const results = await Promise.allSettled(
                backup.locations.map(location => 
                    this.restoreLocation(location)
                )
            );

            // Analyze results
            const succeeded = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            return {
                success: true,
                message: `Restored ${succeeded} locations, ${failed} failed`
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to restore backup: ${error.message}`
            };
        }
    }

    /**
     * Read and parse backup file
     */
    static async readBackupFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    resolve(backup);
                } catch (error) {
                    reject(new Error('Invalid JSON in backup file'));
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read backup file'));
            reader.readAsText(file);
        });
    }

    /**
     * Validate backup format
     */
    static isValidBackup(backup) {
        return (
            backup &&
            typeof backup === 'object' &&
            typeof backup.timestamp === 'string' &&
            typeof backup.version === 'string' &&
            Array.isArray(backup.locations) &&
            backup.locations.every(this.isValidLocation)
        );
    }

    /**
     * Basic location validation
     */
    static isValidLocation(location) {
        return (
            location &&
            typeof location === 'object' &&
            typeof location.id === 'string' &&
            typeof location.name === 'string' &&
            location.coordinates &&
            typeof location.coordinates.lat === 'number' &&
            typeof location.coordinates.lng === 'number'
        );
    }

    /**
     * Restore a single location
     */
    static async restoreLocation(location) {
        const response = await fetch(`/api/locations/${location.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(location)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to restore location');
        }

        return response.json();
    }
}

export default BackupManager;