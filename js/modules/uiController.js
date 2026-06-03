/**
 * UIController - Handles all UI updates and interactions
 */

import { StringUtils } from '../utils/stringUtils.js';

export class UIController {
    constructor() {
        this.makeSelect = document.getElementById('makeSelect');
        this.modelSelect = document.getElementById('modelSelect');
        this.resultGrid = document.getElementById('fitmentGrid');
        this.resultCount = document.getElementById('resultCount');
        this.statsBadge = document.getElementById('statsBadge');
        this.stringUtils = new StringUtils();
    }

    /**
     * Update the stats badge with record count
     */
    updateStatsBadge(message) {
        this.statsBadge.innerHTML = `
            <i class="fas fa-database" aria-hidden="true"></i>
            <span>${message}</span>
        `;
    }

    /**
     * Show error message
     */
    showError(message) {
        this.statsBadge.innerHTML = `
            <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
            <span>${message}</span>
        `;
        this.resultGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Populate the make dropdown
     */
    populateMakes(makes) {
        this.makeSelect.innerHTML = '<option value="">-- Select Make --</option>';
        makes.forEach(make => {
            const option = document.createElement('option');
            option.value = make;
            option.textContent = make;
            this.makeSelect.appendChild(option);
        });
    }

    /**
     * Populate the model dropdown for a selected make
     */
    populateModels(models) {
        this.modelSelect.innerHTML = '<option value="">-- Select Model --</option>';
        
        if (models.length === 0) {
            this.modelSelect.disabled = true;
            return;
        }

        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.title;
            option.textContent = model.title.length > 60 
                ? model.title.substring(0, 57) + '...' 
                : model.title;
            this.modelSelect.appendChild(option);
        });
        
        this.modelSelect.disabled = false;
    }

    /**
     * Display fitment results
     */
    displayResults(record) {
        const wolfraceUrl = this.stringUtils.createWolfraceUrl(record.title);
        this.resultCount.textContent = `Fitment for ${this.stringUtils.escapeHtml(record.title)}`;
        
        this.resultGrid.innerHTML = `
            <div class="fitment-card">
                <div class="vehicle-title">
                    <i class="fas fa-car" aria-hidden="true"></i> 
                    ${this.stringUtils.escapeHtml(record.title)}
                </div>
                <div class="specs-container">
                    <div class="spec-row">
                        <span class="spec-label">⚙️ PCD</span>
                        <span class="spec-value spec-value-pcd">${this.stringUtils.cleanPCD(record.pcd)}</span>
                    </div>
                    <div class="spec-row">
                        <span class="spec-label">📏 Offset</span>
                        <span class="spec-value">${record.offset || '—'} mm</span>
                    </div>
                    <div class="spec-row">
                        <span class="spec-label">🎯 Centre Bore</span>
                        <span class="spec-value">${record.hubBore || '—'} mm</span>
                    </div>
                    <div class="spec-row">
                        <span class="spec-label">🔩 Thread</span>
                        <span class="spec-value">${record.thread || '—'}</span>
                    </div>
                    <div class="spec-row">
                        <span class="spec-label">🔧 Fastener</span>
                        <span class="spec-value">${record.type || '—'} (Hex ${record.hex || '—'})</span>
                    </div>
                    <div class="spec-row">
                        <span class="spec-label">🛞 Tyre Size</span>
                        <span class="spec-value">${record.tyre || '—'}</span>
                    </div>
                    <div class="spec-row">
                        <span class="spec-label">📐 Wheel Width</span>
                        <span class="spec-value">${record.width || '—'} inches</span>
                    </div>
                </div>
                <a href="${wolfraceUrl}" target="_blank" rel="noopener" class="wolfrace-btn">
                    <i class="fas fa-external-link-alt" aria-hidden="true"></i>
                    <span>Search for wheels on Wolfrace</span>
                </a>
            </div>
        `;
        
        this.scrollToElement('fitmentGrid');
    }

    /**
     * Clear results and show default message
     */
    clearResults() {
        this.resultCount.textContent = 'Select a make and model';
        this.resultGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" aria-hidden="true"></i>
                <p>Select a make and model to view fitment specs</p>
            </div>
        `;
    }

    /**
     * Update results header message
     */
    updateResultsMessage(message) {
        this.resultCount.textContent = message;
    }

    /**
     * Smooth scroll to an element
     */
    scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}
