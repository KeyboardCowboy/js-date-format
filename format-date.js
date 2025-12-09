/**
 * ============================================================================
 * SQUARESPACE DATE FORMATTER
 * ============================================================================
 * Reformats date strings in Squarespace with custom styling and semantic HTML
 * 
 * This script finds date elements on your Squarespace site, parses their text
 * content, and replaces them with a custom format. Each date component (day,
 * month, year, weekday) gets wrapped in a span with a semantic class name
 * for easy CSS targeting.
 * 
 * GitHub: [your-repo-url]
 * Last updated: December 2025
 * 
 * USAGE:
 * 1. Load this script in your Squarespace Footer Code Injection
 * 2. Define your date formats in window.dateFormats array
 * 3. Style with CSS using the semantic class names
 * 
 * Available format tokens:
 * - YYYY = Full year (2025)
 * - YY = Short year (25)
 * - MMMM = Full month name (December)
 * - MMM = Short month name (Dec)
 * - MM = Month number with leading zero (12)
 * - M = Month number (12)
 * - dddd = Full day name (Tuesday)
 * - ddd = Short day name (Tue)
 * - DD = Day with leading zero (09)
 * - D = Day (9)
 * 
 * Generated CSS classes:
 * - .year-full, .year-short
 * - .month-long, .month-short, .month-numeric
 * - .day-numeric
 * - .weekday-long, .weekday-short
 * ============================================================================
 */

(function() {
  
  /**
   * formatDate - Core formatting function
   * 
   * Finds elements matching the selector, parses their date text,
   * and replaces it with formatted HTML using the provided format string.
   * 
   * @param {Object} data - Configuration object
   * @param {string} data.selector - CSS selector to target date elements
   * @param {string} data.name - Class name for the outer wrapper span
   * @param {string} data.format - Format string using tokens (e.g., 'ddd MMM D, YYYY')
   */
  function formatDate(data) {
    const { selector, name, format } = data;
    const elements = document.querySelectorAll(selector);
    
    // Loop through all matching elements on the page
    elements.forEach(el => {
      // Extract the existing date text from the element
      const dateText = el.textContent.trim();
      
      // Parse the date string into a JavaScript Date object
      const date = new Date(dateText);
      
      // Skip this element if the date couldn't be parsed
      if (isNaN(date.getTime())) return;
      
      // Add machine-readable datetime attribute for <time> elements
      // This improves accessibility and SEO
      if (el.tagName === 'TIME') {
        el.setAttribute('datetime', date.toISOString().split('T')[0]);
      }
      
      // Define all available format tokens with their corresponding values
      // and CSS class names for each date component
      const tokens = {
        'YYYY': { value: date.getFullYear(), class: 'year-full' },
        'YY': { value: String(date.getFullYear()).slice(-2), class: 'year-short' },
        'MMMM': { value: date.toLocaleDateString('en-US', { month: 'long' }), class: 'month-long' },
        'MMM': { value: date.toLocaleDateString('en-US', { month: 'short' }), class: 'month-short' },
        'MM': { value: String(date.getMonth() + 1).padStart(2, '0'), class: 'month-numeric' },
        'M': { value: date.getMonth() + 1, class: 'month-numeric' },
        'dddd': { value: date.toLocaleDateString('en-US', { weekday: 'long' }), class: 'weekday-long' },
        'ddd': { value: date.toLocaleDateString('en-US', { weekday: 'short' }), class: 'weekday-short' },
        'DD': { value: String(date.getDate()).padStart(2, '0'), class: 'day-numeric' },
        'D': { value: date.getDate(), class: 'day-numeric' }
      };
      
      // Start with the format string provided
      let formatted = format;
      
      // Sort tokens by length (longest first) to prevent partial replacements
      // Example: We want to replace 'YYYY' before 'YY' to avoid conflicts
      const sortedTokens = Object.keys(tokens).sort((a, b) => b.length - a.length);
      
      // Replace each token in the format string with its HTML-wrapped value
      sortedTokens.forEach(token => {
        const { value, class: className } = tokens[token];
        
        // Wrap the value in a span with the semantic class name
        const wrapped = `<span class="${className}">${value}</span>`;
        
        // Escape special regex characters in the token
        const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Use word boundaries (\b) to ensure we only match complete tokens
        // This prevents "D" from matching inside "Dec" or "ddd"
        formatted = formatted.replace(new RegExp(`\\b${escapedToken}\\b`, 'g'), wrapped);
      });
      
      // Update the element with the new formatted date HTML
      // The outer span uses the custom 'name' class for targeted styling
      el.innerHTML = `<span class="${name}">${formatted}</span>`;
    });
  }
  
  /**
   * applyAllDateFormats - Applies all configured date formats
   * 
   * Reads the window.dateFormats array (defined in Squarespace) and
   * applies each format configuration to the page.
   */
  function applyAllDateFormats() {
    // Check if dateFormats array exists and is valid
    if (window.dateFormats && Array.isArray(window.dateFormats)) {
      // Apply each format configuration
      window.dateFormats.forEach(config => formatDate(config));
    }
  }
  
  // ============================================================================
  // AUTO-EXECUTION
  // ============================================================================
  // These event listeners ensure dates are formatted on initial page load
  // and when Squarespace loads new content via AJAX
  
  // Run on initial page load
  // Check if DOM is already loaded (in case script loads late)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAllDateFormats);
  } else {
    // DOM already loaded, run immediately
    applyAllDateFormats();
  }
  
  // Run when Squarespace loads new content via AJAX
  // This handles infinite scroll, pagination, category filtering, etc.
  window.addEventListener('mercury:load', applyAllDateFormats);
  
  // ============================================================================
  // GLOBAL API
  // ============================================================================
  // Expose formatDate function globally in case someone wants to
  // manually format dates added to the page dynamically
  window.formatDate = formatDate;
  
})();
