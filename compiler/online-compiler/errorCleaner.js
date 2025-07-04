const path = require("path");

/**
 * Utility function to clean error messages by removing internal file paths only
 */
const cleanErrorMessage = (errorMessage, type = 'Runtime') => {
    if (!errorMessage) return `${type} Error: Unknown error occurred`;
    
    let cleanedMessage = errorMessage.toString();
    
    // Remove only file paths, keeping the rest of the error message intact
    const pathPatterns = [
        // Remove full paths to our project directories
        /[A-Za-z]:[\\\/].*?[\\\/]Online-Judge[\\\/].*?[\\\/]codes[\\\/]/g,
        /[A-Za-z]:[\\\/].*?[\\\/]compiler[\\\/].*?[\\\/]codes[\\\/]/g,
        /[A-Za-z]:[\\\/].*?[\\\/]online-compiler[\\\/]codes[\\\/]/g,
        // Remove any Windows-style paths containing our directories
        /[A-Za-z]:[\\\/].*?[\\\/](codes|outputs|inputs)[\\\/]/g,
        // Remove quoted paths
        /"[^"]*[\\\/](codes|outputs|inputs)[\\\/][^"]*"/g,
        // Remove temp file paths
        /\/tmp\/.*?\//g,
        // Remove just the file path part before the filename
        /File ".*[\\\/]/g,
    ];
    
    // Remove all path patterns but keep the rest
    pathPatterns.forEach(pattern => {
        cleanedMessage = cleanedMessage.replace(pattern, '');
    });
    
    // Remove UUID-based temporary filenames (but keep the extension for context)
    cleanedMessage = cleanedMessage.replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(cpp|java|py|js)/g, 'source.$1');
    
    // Clean up extra spaces that might be left after path removal
    cleanedMessage = cleanedMessage.replace(/\s+/g, ' ').trim();
    
    // Remove leading/trailing colons and spaces that might be artifacts
    cleanedMessage = cleanedMessage.replace(/^[:;\s]+|[:;\s]+$/g, '');
    
    return cleanedMessage;
};

/**
 * Clean compilation errors specifically
 */
const cleanCompilationError = (errorMessage) => {
    return cleanErrorMessage(errorMessage, 'Compilation');
};

/**
 * Clean runtime errors specifically
 */
const cleanRuntimeError = (errorMessage) => {
    return cleanErrorMessage(errorMessage, 'Runtime');
};

/**
 * Clean timeout errors
 */
const cleanTimeoutError = () => {
    return 'Time Limit Exceeded: Your program took too long to execute';
};

/**
 * Clean memory errors
 */
const cleanMemoryError = () => {
    return 'Memory Limit Exceeded: Your program used too much memory';
};

module.exports = {
    cleanErrorMessage,
    cleanCompilationError,
    cleanRuntimeError,
    cleanTimeoutError,
    cleanMemoryError
};
