/**
 * FitmentManager - Handles data loading and model organization
 */

export class FitmentManager {
    constructor() {
        this.fitmentData = [];
        this.modelsByMake = {};
    }

    /**
     * Load fitment data from JSON files
     */
    async loadData() {
        try {
            // Try primary data file first
            const response = await fetch('/fitment-data.json');
            if (response.ok) {
                this.fitmentData = await response.json();
                this.organizData();
                return;
            }
        } catch (error) {
            console.warn('Primary data file not found, trying fallback');
        }

        try {
            // Try fallback data file
            const response = await fetch('/fitment-safe.json');
            if (response.ok) {
                this.fitmentData = await response.json();
                this.organizData();
                return;
            }
        } catch (error) {
            console.error('Failed to load data files:', error);
            throw new Error('Unable to load fitment data');
        }
    }

    /**
     * Organize fitment data by make and model
     */
    organizData() {
        this.modelsByMake = {};
        
        this.fitmentData.forEach(record => {
            const brand = record.brand || record.title.split(' ')[0];
            
            if (!brand) return;
            
            if (!this.modelsByMake[brand]) {
                this.modelsByMake[brand] = [];
            }

            this.modelsByMake[brand].push({
                title: record.title,
                hubBore: record.hubBore,
                thread: record.thread,
                hex: record.hex,
                type: record.type,
                pcd: record.pcd,
                offset: record.offset,
                width: record.width,
                tyre: record.tyre,
                brand: brand
            });
        });

        // Sort models within each make
        Object.keys(this.modelsByMake).forEach(make => {
            this.modelsByMake[make].sort((a, b) => 
                a.title.localeCompare(b.title)
            );
        });
    }

    /**
     * Get all makes sorted alphabetically
     */
    getMakes() {
        return Object.keys(this.modelsByMake).sort();
    }

    /**
     * Get models for a specific make
     */
    getModelsForMake(make) {
        return this.modelsByMake[make] || [];
    }

    /**
     * Get a specific record by make and model title
     */
    getRecord(make, modelTitle) {
        const models = this.getModelsForMake(make);
        return models.find(m => m.title === modelTitle);
    }

    /**
     * Find a record by title search
     */
    findByTitle(searchTerm) {
        const normalizedTerm = searchTerm.toLowerCase();
        return this.fitmentData.find(record => 
            record.title.toLowerCase() === normalizedTerm ||
            record.title.toLowerCase().includes(normalizedTerm)
        );
    }

    /**
     * Get total number of records
     */
    getRecordCount() {
        return this.fitmentData.length;
    }
}
