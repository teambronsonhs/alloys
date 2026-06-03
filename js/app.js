/**
 * Alloy Wheels Info - Main Application
 * Handles vehicle fitment database search and display
 */

class StringUtils {
    cleanPCD(pcd) {
        if (!pcd) return '—';
        let cleaned = pcd
            .replace(/^0x/, '')
            .replace(/ None$/, '')
            .replace(/None/, '')
            .trim();
        return cleaned || '—';
    }

    createWolfraceUrl(title) {
        const slug = this.createSlug(title);
        return `https://www.wolfrace.co.uk/${slug}-alloy-wheels`;
    }

    createSlug(text) {
        return text.toLowerCase()
            .replace(/ to /g, '-to-')
            .replace(/ /g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    escapeHtml(str) {
        if (!str) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return str.replace(/[&<>"']/g, m => map[m]);
    }

    truncate(text, length = 60, ellipsis = '...') {
        if (text.length <= length) return text;
        return text.substring(0, length - ellipsis.length) + ellipsis;
    }
}

class FitmentManager {
    constructor() {
        this.fitmentData = [];
        this.modelsByMake = {};
    }

    async loadData() {
        try {
            const response = await fetch('fitment-data.json');
            if (response.ok) {
                this.fitmentData = await response.json();
                this.organizeData();
                return;
            }
        } catch (error) {
            console.warn('Primary data file not found, trying fallback');
        }

        try {
            const response = await fetch('fitment-safe.json');
            if (response.ok) {
                this.fitmentData = await response.json();
                this.organizeData();
                return;
            }
        } catch (error) {
            console.error('Failed to load data files:', error);
            throw new Error('Unable to load fitment data');
        }
    }

    organizeData() {
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

        Object.keys(this.modelsByMake).forEach(make => {
            this.modelsByMake[make].sort((a, b) => 
                a.title.localeCompare(b.title)
            );
        });
    }

    getMakes() {
        return Object.keys(this.modelsByMake).sort();
    }

    getModelsForMake(make) {
        return this.modelsByMake[make] || [];
    }

    getRecord(make, modelTitle) {
        const models = this.getModelsForMake(make);
        return models.find(m => m.title === modelTitle);
    }

    findByTitle(searchTerm) {
        const normalizedTerm = searchTerm.toLowerCase();
        return this.fitmentData.find(record => 
            record.title.toLowerCase() === normalizedTerm ||
            record.title.toLowerCase().includes(normalizedTerm)
        );
    }

    getRecordCount() {
        return this.fitmentData.length;
    }
}

class UIController {
    constructor() {
        this.makeSelect = document.getElementById('makeSelect');
        this.modelSelect = document.getElementById('modelSelect');
        this.resultGrid = document.getElementById('fitmentGrid');
        this.resultCount = document.getElementById('resultCount');
        this.statsBadge = document.getElementById('statsBadge');
        this.stringUtils = new StringUtils();
    }

    updateStatsBadge(message) {
        this.statsBadge.innerHTML = `
            <i class="fas fa-database" aria-hidden="true"></i>
            <span>${message}</span>
        `;
    }

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

    populateMakes(makes) {
        this.makeSelect.innerHTML = '<option value="">-- Select Make --</option>';
        makes.forEach(make => {
            const option = document.createElement('option');
            option.value = make;
            option.textContent = make;
            this.makeSelect.appendChild(option);
        });
    }

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

    clearResults() {
        this.resultCount.textContent = 'Select a make and model';
        this.resultGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" aria-hidden="true"></i>
                <p>Select a make and model to view fitment specs</p>
            </div>
        `;
    }

    updateResultsMessage(message) {
        this.resultCount.textContent = message;
    }

    scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

class URLHandler {
    updateURL(title) {
        const slug = this.createSlug(title);
        const url = new URL(window.location);
        url.searchParams.set('car', slug);
        window.history.replaceState({}, '', url);
    }

    removeCarParam() {
        const url = new URL(window.location);
        url.searchParams.delete('car');
        window.history.replaceState({}, '', url);
    }

    loadCarFromURL(fitmentManager, uiController) {
        const urlParams = new URLSearchParams(window.location.search);
        const carSlug = urlParams.get('car');
        
        if (!carSlug || fitmentManager.getRecordCount() === 0) {
            return;
        }

        const searchTerm = carSlug.toLowerCase().replace(/-/g, ' ');
        const match = fitmentManager.findByTitle(searchTerm);

        if (match) {
            this.selectFromURL(match, fitmentManager, uiController);
        }
    }

    selectFromURL(match, fitmentManager, uiController) {
        const make = match.brand || match.title.split(' ')[0];
        const makeSelect = document.getElementById('makeSelect');
        const modelSelect = document.getElementById('modelSelect');

        for (let i = 0; i < makeSelect.options.length; i++) {
            if (makeSelect.options[i].value === make) {
                makeSelect.selectedIndex = i;
                makeSelect.dispatchEvent(new Event('change'));
                break;
            }
        }

        const checkInterval = setInterval(() => {
            if (modelSelect.options.length > 1) {
                clearInterval(checkInterval);
                for (let i = 0; i < modelSelect.options.length; i++) {
                    if (modelSelect.options[i].value === match.title) {
                        modelSelect.selectedIndex = i;
                        modelSelect.dispatchEvent(new Event('change'));
                        break;
                    }
                }
            }
        }, 100);

        setTimeout(() => clearInterval(checkInterval), 5000);
    }

    createSlug(title) {
        return title.toLowerCase()
            .replace(/ to /g, '-to-')
            .replace(/ /g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
}

class AlloyWheelsApp {
    constructor() {
        this.fitmentManager = new FitmentManager();
        this.uiController = new UIController();
        this.urlHandler = new URLHandler();
        this.init();
    }

    async init() {
        try {
            await this.fitmentManager.loadData();
            
            this.uiController.updateStatsBadge(
                `${this.fitmentManager.getRecordCount()} fitment records`
            );
            
            const makes = this.fitmentManager.getMakes();
            this.uiController.populateMakes(makes);
            
            this.setupEventListeners();
            
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
