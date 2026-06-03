/**
 * StringUtils - Utility functions for string manipulation
 */

export class StringUtils {
    /**
     * Clean PCD string
     */
    cleanPCD(pcd) {
        if (!pcd) return '—';
        let cleaned = pcd
            .replace(/^0x/, '')
            .replace(/ None$/, '')
            .replace(/None/, '')
            .trim();
        return cleaned || '—';
    }

    /**
     * Create Wolfrace URL from vehicle title
     */
    createWolfraceUrl(title) {
        const slug = this.createSlug(title);
        return `https://www.wolfrace.co.uk/${slug}-alloy-wheels`;
    }

    /**
     * Create URL-friendly slug
     */
    createSlug(text) {
        return text.toLowerCase()
            .replace(/ to /g, '-to-')
            .replace(/ /g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * Escape HTML special characters
     */
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

    /**
     * Truncate text with ellipsis
     */
    truncate(text, length = 60, ellipsis = '...') {
        if (text.length <= length) return text;
        return text.substring(0, length - ellipsis.length) + ellipsis;
    }
}