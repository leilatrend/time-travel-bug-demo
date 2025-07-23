/**
 * Data Validation Utilities
 * Common validation functions for the application
 */

class DataValidator {
    /**
     * Validate email format with comprehensive rules
     */
    static validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { valid: false, error: 'Email is required and must be a string' };
        }

        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

        if (!emailRegex.test(email)) {
            return { valid: false, error: 'Invalid email format' };
        }

        if (email.length > 254) {
            return { valid: false, error: 'Email address too long' };
        }

        return { valid: true };
    }

    /**
     * Validate password strength
     */
    static validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { valid: false, error: 'Password is required and must be a string' };
        }

        if (password.length < 8) {
            return { valid: false, error: 'Password must be at least 8 characters long' };
        }

        if (password.length > 128) {
            return { valid: false, error: 'Password must not exceed 128 characters' };
        }

        // Check for common patterns
        const hasLowerCase = /[a-z]/.test(password);
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const strength = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

        let strengthLabel = 'Weak';
        if (strength >= 3) strengthLabel = 'Strong';
        else if (strength >= 2) strengthLabel = 'Medium';

        return {
            valid: true,
            strength: strengthLabel,
            score: strength,
            suggestions: {
                needsLowerCase: !hasLowerCase,
                needsUpperCase: !hasUpperCase,
                needsNumbers: !hasNumbers,
                needsSpecialChar: !hasSpecialChar
            }
        };
    }

    /**
     * Validate username
     */
    static validateUsername(username) {
        if (!username || typeof username !== 'string') {
            return { valid: false, error: 'Username is required and must be a string' };
        }

        if (username.length < 3) {
            return { valid: false, error: 'Username must be at least 3 characters long' };
        }

        if (username.length > 30) {
            return { valid: false, error: 'Username must not exceed 30 characters' };
        }

        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(username)) {
            return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
        }

        return { valid: true };
    }

    /**
     * Validate URL format
     */
    static validateURL(url) {
        if (!url || typeof url !== 'string') {
            return { valid: false, error: 'URL is required and must be a string' };
        }

        try {
            const urlObj = new URL(url);

            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
            }

            return { valid: true, protocol: urlObj.protocol, domain: urlObj.hostname };
        } catch (error) {
            return { valid: false, error: 'Invalid URL format' };
        }
    }

    /**
     * Validate phone number (international format)
     */
    static validatePhoneNumber(phone) {
        if (!phone || typeof phone !== 'string') {
            return { valid: false, error: 'Phone number is required and must be a string' };
        }

        // Remove all non-digit characters except +
        const cleanPhone = phone.replace(/[^\d+]/g, '');

        // International format: +[country code][number]
        const phoneRegex = /^\+\d{1,3}\d{4,14}$/;

        if (!phoneRegex.test(cleanPhone)) {
            return { valid: false, error: 'Phone number must be in international format (+1234567890)' };
        }

        return { valid: true, formatted: cleanPhone };
    }

    /**
     * Validate date format and range
     */
    static validateDate(dateString, minDate = null, maxDate = null) {
        if (!dateString) {
            return { valid: false, error: 'Date is required' };
        }

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return { valid: false, error: 'Invalid date format' };
        }

        if (minDate && date < new Date(minDate)) {
            return { valid: false, error: `Date must be after ${minDate}` };
        }

        if (maxDate && date > new Date(maxDate)) {
            return { valid: false, error: `Date must be before ${maxDate}` };
        }

        return { valid: true, date: date.toISOString() };
    }

    /**
     * Validate numeric range
     */
    static validateNumericRange(value, min = null, max = null, isInteger = false) {
        if (value === null || value === undefined) {
            return { valid: false, error: 'Value is required' };
        }

        const num = Number(value);

        if (isNaN(num)) {
            return { valid: false, error: 'Value must be a valid number' };
        }

        if (isInteger && !Number.isInteger(num)) {
            return { valid: false, error: 'Value must be an integer' };
        }

        if (min !== null && num < min) {
            return { valid: false, error: `Value must be at least ${min}` };
        }

        if (max !== null && num > max) {
            return { valid: false, error: `Value must not exceed ${max}` };
        }

        return { valid: true, value: num };
    }

    /**
     * Validate text length and content
     */
    static validateText(text, minLength = 0, maxLength = Infinity, allowEmpty = true) {
        if (!allowEmpty && (!text || text.trim().length === 0)) {
            return { valid: false, error: 'Text cannot be empty' };
        }

        if (!text) {
            text = '';
        }

        if (typeof text !== 'string') {
            return { valid: false, error: 'Text must be a string' };
        }

        if (text.length < minLength) {
            return { valid: false, error: `Text must be at least ${minLength} characters long` };
        }

        if (text.length > maxLength) {
            return { valid: false, error: `Text must not exceed ${maxLength} characters` };
        }

        return { valid: true, length: text.length };
    }

    /**
     * Validate array structure
     */
    static validateArray(arr, minItems = 0, maxItems = Infinity, itemValidator = null) {
        if (!Array.isArray(arr)) {
            return { valid: false, error: 'Value must be an array' };
        }

        if (arr.length < minItems) {
            return { valid: false, error: `Array must contain at least ${minItems} items` };
        }

        if (arr.length > maxItems) {
            return { valid: false, error: `Array must not contain more than ${maxItems} items` };
        }

        if (itemValidator) {
            for (let i = 0; i < arr.length; i++) {
                const itemResult = itemValidator(arr[i], i);
                if (!itemResult.valid) {
                    return { valid: false, error: `Item at index ${i}: ${itemResult.error}` };
                }
            }
        }

        return { valid: true, length: arr.length };
    }

    /**
     * Validate object structure
     */
    static validateObject(obj, requiredFields = [], optionalFields = []) {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
            return { valid: false, error: 'Value must be an object' };
        }

        const allowedFields = [...requiredFields, ...optionalFields];
        const objectKeys = Object.keys(obj);

        // Check for required fields
        for (const field of requiredFields) {
            if (!(field in obj)) {
                return { valid: false, error: `Required field '${field}' is missing` };
            }
        }

        // Check for unknown fields
        for (const key of objectKeys) {
            if (!allowedFields.includes(key)) {
                return { valid: false, error: `Unknown field '${key}'` };
            }
        }

        return { valid: true, fields: objectKeys };
    }

    /**
     * Sanitize input to prevent XSS
     */
    static sanitizeInput(input) {
        if (typeof input !== 'string') {
            return input;
        }

        return input
            .replace(/[<>'"]/g, function (match) {
                const escapeMap = {
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#x27;'
                };
                return escapeMap[match];
            })
            .trim();
    }

    /**
     * Validate and sanitize form data
     */
    static validateFormData(data, schema) {
        const result = {
            valid: true,
            errors: {},
            sanitized: {}
        };

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            let sanitizedValue = value;

            // Check if field is required
            if (rules.required && (value === undefined || value === null || value === '')) {
                result.valid = false;
                result.errors[field] = `${field} is required`;
                continue;
            }

            // Skip validation if field is optional and empty
            if (!rules.required && (value === undefined || value === null || value === '')) {
                continue;
            }

            // Apply validation rules
            if (rules.type === 'email') {
                const emailResult = this.validateEmail(value);
                if (!emailResult.valid) {
                    result.valid = false;
                    result.errors[field] = emailResult.error;
                    continue;
                }
            }

            if (rules.type === 'text') {
                const textResult = this.validateText(
                    value,
                    rules.minLength,
                    rules.maxLength,
                    !rules.required
                );
                if (!textResult.valid) {
                    result.valid = false;
                    result.errors[field] = textResult.error;
                    continue;
                }
                sanitizedValue = this.sanitizeInput(value);
            }

            if (rules.type === 'number') {
                const numResult = this.validateNumericRange(
                    value,
                    rules.min,
                    rules.max,
                    rules.integer
                );
                if (!numResult.valid) {
                    result.valid = false;
                    result.errors[field] = numResult.error;
                    continue;
                }
                sanitizedValue = numResult.value;
            }

            result.sanitized[field] = sanitizedValue;
        }

        return result;
    }
}

module.exports = DataValidator;
