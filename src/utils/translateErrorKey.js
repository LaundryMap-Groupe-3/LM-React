/**
 * Translate an error key received from backend API
 * If the key looks like a translation key (contains dot), attempt to translate it
 * Otherwise try to translate it as auth.[key]
 * 
 * @param {string} errorKey - The error string/key from API
 * @param {Function} t - The translation function from useTranslation
 * @returns {string} The translated error message or original string
 */
export const translateErrorKey = (errorKey, t) => {
  if (!errorKey) return '';
  
  let keyToTranslate = errorKey;
  
  // Check if it looks like a translation key (contains dot, snake_case format)
  if (typeof errorKey === 'string') {
    if (errorKey.includes('.')) {
      keyToTranslate = errorKey;
    } else {
      // Try with auth prefix for backend error keys
      keyToTranslate = `auth.${errorKey}`;
    }
    
    const translated = t(keyToTranslate);
    // If translation returned the same key, it means translation not found
    // In that case return the original error
    return translated !== keyToTranslate ? translated : errorKey;
  }
  
  return errorKey;
};

/**
 * Handle validation errors from API response
 * Maps field errors and attempts to translate error keys
 * 
 * @param {Object} errors - The errors object from API response
 * @param {Function} t - The translation function from useTranslation
 * @returns {string} Formatted error message with all field errors
 */
export const formatValidationErrors = (errors, t) => {
  if (!errors || typeof errors !== 'object') return '';
  
  return Object.entries(errors)
    .map(([field, message]) => {
      const translatedMessage = translateErrorKey(message, t);
      return `${field}: ${translatedMessage}`;
    })
    .join('\n');
};
