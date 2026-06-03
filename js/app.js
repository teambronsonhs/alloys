/**
 * Alloy Wheels Info - Main Application Module
 * Handles vehicle fitment database search and display
 */

import { FitmentManager } from './modules/fitmentManager.js';
import { UIController } from './modules/uiController.js';
import { URLHandler } from './modules/urlHandler.js';

class AlloyWheelsApp {
    constructor() {
        this.fitmentManager = new FitmentManager();
        this.uiController = new UIController();
        this.urlHandler = new URLHandler();
        this.init();
    }

    async init() {
        try {
            // Load data
            await this.fitmentManager.loadData();
            
            // Update UI with loaded data
            this.uiController.updateStatsBadge(
                `${this.fitmentManager.getRecordCount()} fitment records`
            );
            
            // Populate dropdowns
            const makes = this.fitmentManager.getMakes();
            this.uiController.populateMakes(makes);
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load car from URL if present
            this.urlHandler.loadCarFromURL(this.fitmentManager, this.uiController);
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.uiController.showError('Unable to load fitment data');
        }
    }

    setupEventListeners() {
        const makeSelect = document.getElementById('makeSelect');
        const modelSelect = document.getElementById('modelSelect');
        const resetBtn = document.getElementById('resetBtn');
        const searchForm = document.getElementById('searchForm');

        makeSelect.addEventListener('change', (e) => {
            this.handleMakeChange(e.target.value);
        });

        modelSelect.addEventListener('change', (e) => {
            this.handleModelChange(e.target.value);
        });

        resetBtn.addEventListener('click', () => {
            this.handleReset();
        });

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    handleMakeChange(selectedMake) {
        if (!selectedMake) {
            this.handleReset();
            return;
        }

        const models = this.fitmentManager.getModelsForMake(selectedMake);
        this.uiController.populateModels(models);
        this.uiController.updateResultsMessage(`Select a model for ${selectedMake}`);
        this.uiController.scrollToElement('modelSelect');
    }

    handleModelChange(selectedModel) {
        if (!selectedModel) {
            this.uiController.clearResults();
            return;
        }

        const makeSelect = document.getElementById('makeSelect');
        const make = makeSelect.value;
        
        const record = this.fitmentManager.getRecord(make, selectedModel);
        if (record) {
            this.uiController.displayResults(record);
            this.urlHandler.updateURL(record.title);
        }
    }

    handleReset() {
        document.getElementById('makeSelect').value = '';
        document.getElementById('modelSelect').innerHTML = '<option value="">-- Select Model --</option>';
        document.getElementById('modelSelect').disabled = true;
        this.uiController.clearResults();
        this.urlHandler.removeCarParam();
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AlloyWheelsApp();
    });
} else {
    new AlloyWheelsApp();
}