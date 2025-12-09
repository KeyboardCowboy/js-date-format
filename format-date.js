/**
 * ============================================================================
 * SQUARESPACE DATE MANAGER
 * ============================================================================
 * Unified date handling for Squarespace items with multiple date displays.
 * 
 * HOW IT WORKS:
 * 1. Finds container elements (e.g., .summary-item)
 * 2. Locates the most reliable date source within (<time> element preferred)
 * 3. Stores parsed date as data attributes on the container
 * 4. Formats all date displays within that container using stored data
 * 
 * This solves the problem of having multiple date displays per item where
 * only one has parseable date information (like thumbnail overlays that show
 * "Dec 9" without the year).
 * 
 * GitHub: [your-repo-url]
 * Last updated: December 2025
 * ============================================================================
 */

(function() {
  
  /**
   * Parse date from an element
   * Tries datetime attribute first, then text content
   */
  function parseDateFromElement(element) {
    // Try datetime attribute (most reliable)
    let dateValue = element.getAttribute('datetime');
    if (dateValue) {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) return date;
    }
    
    // Try parsing text content
    const dateText = element.textContent.trim();
    const date = new Date(dateText);
    if (!isNaN(date.getTime())) return date;
    
    return null;
  }
  
  /**
   * Add data attributes to container based on parsed date
   */
  function addDateAttributes(container, date) {
    const isoDate = date.toISOString().split('T')[0];
    container.setAttribute('data-date', isoDate);
    container.setAttribute('data-year', date.getFullYear());
    container.setAttribute('data-month', date.getMonth() + 1);
    container.setAttribute('data-day', date.getDate());
  }
  
  /**
   * Format a date element using tokens
   */
  function formatDateElement(element, date, format, wrapperClass) {
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
    
    let formatted = format;
    const sortedTokens = Object.keys(tokens).sort((a, b) => b.length - a.length);
    
    sortedTokens.forEach(token => {
      const { value, class: className } = tokens[token];
      const wrapped = `<span class="${className}">${value}</span>`;
      const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      formatted = formatted.replace(new RegExp(`\\b${escapedToken}\\b`, 'g'), wrapped);
    });
    
    // Add datetime attribute if element is <time>
    if (element.tagName === 'TIME') {
      element.setAttribute('datetime', date.toISOString().split('T')[0]);
    }
    
    element.innerHTML = `<span class="${wrapperClass}">${formatted}</span>`;
  }
  
  /**
   * Main processing function
   */
  function processDates() {
    if (!window.dateConfig || !Array.isArray(window.dateConfig)) return;
    
    window.dateConfig.forEach(config => {
      const { 
        itemSelector,           // Container element (e.g., '.summary-item')
        dateSourceSelector,     // Where to find the parseable date (e.g., 'time')
        formats                 // Array of format configs for elements within the item
      } = config;
      
      // Find all container items
      const items = document.querySelectorAll(itemSelector);
      
      items.forEach(item => {
        // Find the date source within this item
        const dateSource = item.querySelector(dateSourceSelector);
        if (!dateSource) return;
        
        // Parse the date
        const date = parseDateFromElement(dateSource);
        if (!date) return;
        
        // Store date as data attributes on the container
        addDateAttributes(item, date);
        
        // Format all date displays within this item
        formats.forEach(formatConfig => {
          const { selector, name, format } = formatConfig;
          const elements = item.querySelectorAll(selector);
          
          elements.forEach(el => {
            formatDateElement(el, date, format, name);
          });
        });
      });
    });
  }
  
  // ============================================================================
  // AUTO-EXECUTION
  // ============================================================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processDates);
  } else {
    processDates();
  }
  
  window.addEventListener('mercury:load', processDates);
  
  // Expose for manual calls
  window.processDates = processDates;
  
})();
