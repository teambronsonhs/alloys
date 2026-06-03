/**
 * URLHandler - Manages URL parameters and history
 */

export class URLHandler {
    /**
     * Update URL with car parameter
     */
    updateURL(title) {
        const slug = this.createSlug(title);
        const url = new URL(window.location);
        url.searchParams.set('car', slug);
        window.history.replaceState({}, '', url);
    }

    /**
     * Remove car parameter from URL
     */
    removeCarParam() {
        const url = new URL(window.location);
        url.searchParams.delete('car');
        window.history.replaceState({}, '', url);
    }

    /**
     * Load car from URL if present
     */
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

    /**
     * Select make and model from URL parameters
     */
    selectFromURL(match, fitmentManager, uiController) {
        const make = match.brand || match.title.split(' ')[0];
        const makeSelect = document.getElementById('makeSelect');
        const modelSelect = document.getElementById('modelSelect');

        // Set make
        for (let i = 0; i < makeSelect.options.length; i++) {
            if (makeSelect.options[i].value === make) {
                makeSelect.selectedIndex = i;
                makeSelect.dispatchEvent(new Event('change'));
                break;
            }
        }

        // Wait for model dropdown to populate, then set model
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

        // Timeout after 5 seconds
        setTimeout(() => clearInterval(checkInterval), 5000);
    }

    /**
     * Create URL-friendly slug from title
     */
    createSlug(title) {
        return title.toLowerCase()
            .replace(/ to /g, '-to-')
            .replace(/ /g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
}
