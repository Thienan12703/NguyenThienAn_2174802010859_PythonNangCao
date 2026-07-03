const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isValidEmail = (email) => {
    if (!isNonEmptyString(email)) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
};

const isPositiveNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0;

const isNonNegativeNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;

const sanitizeString = (value) => (typeof value === 'string' ? value.trim() : '');

module.exports = {
    isNonEmptyString,
    isValidEmail,
    isPositiveNumber,
    isNonNegativeNumber,
    sanitizeString,
};
