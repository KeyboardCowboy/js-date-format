/**
 * ============================================================================
 * ADD DATE DATA ATTRIBUTES
 * ============================================================================
 * Finds all <time> elements and adds data-date attributes to their parent
 * elements for easy reference in other scripts.
 * 
 * USAGE:
 * Define your parent selector in window.dateDataConfig
 * 
 * The function adds these attributes to parent elements:
 * - data-date: ISO format date (YYYY-MM-DD)
 * - data-year: Full year (2025)
 * - data-month: Month number (12)
 * - data-day: Day number (9)
 * ============================================================================
 */

(function() {
  
  /**
   * addDateDataAttributes - Core function to add date attributes
   * 
   * @param {string} parentSelector - CSS selector for parent element to add attributes to
   */
  function addDateDataAttributes(parentSelector) {
    const timeElements = document.querySelectorAll('time');
    
    timeElements.forEach(timeEl => {
      // Try to get the datetime attribute first (most reliable)
      let dateValue = timeEl.getAttribute('datetime');
      
      // If no datetime attribute, parse the text content
      if (!dateValue) {
        const dateText = timeEl.textContent.trim();
        const date = new Date(dateText);
        
        // Skip if we can't parse a valid date
        if (isNaN(date.getTime())) return;
        
        // Format as ISO date string (YYYY-MM-DD)
        dateValue = date.toISOString().split('T')[0];
      }
      
      // Find the parent element to add the attribute to
      let parentEl;
      if (parentSelector) {
        // Find the closest ancestor matching the selector
        parentEl = timeEl.closest(parentSelector);
      } else {
        // Use immediate parent
        parentEl = timeEl.parentElement;
      }
      
      // Add the data attributes if we found a parent
      if (parentEl) {
        parentEl.setAttribute('data-date', dateValue);
        
        // Also add individual date components as separate attributes
        // for more flexible filtering/sorting
        const date = new Date(dateValue);
        parentEl.setAttribute('data-year', date.getFullYear());
        parentEl.setAttribute('data-month', date.getMonth() + 1);
        parentEl.setAttribute('data-day', date.getDate());
      }
    });
  }
  
  /**
   * applyDateDataAttributes - Applies the configuration
   * 
   * Reads window.dateDataConfig and applies the parent selector
   */
  function applyDateDataAttributes() {
    if (window.dateDataConfig && window.dateDataConfig.parentSelector) {
      addDateDataAttributes(window.dateDataConfig.parentSelector);
    } else {
      // Default to immediate parent if no config provided
      addDateDataAttributes();
    }
  }
  
  // ============================================================================
  // AUTO-EXECUTION
  // ============================================================================
  
  // Run on initial page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyDateDataAttributes);
  } else {
    applyDateDataAttributes();
  }
  
  // Run when Squarespace loads new content via AJAX
  window.addEventListener('mercury:load', applyDateDataAttributes);
  
  // Expose function globally for manual calls if needed
  window.addDateDataAttributes = addDateDataAttributes;
  
})();
