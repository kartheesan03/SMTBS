export const formatCurrency = (val, compact = false) => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    const currency = localStorage.getItem('currency') || 'INR';
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    const options = {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    };
    if (compact) {
        options.notation = 'compact';
        options.compactDisplay = 'short';
    }
    return new Intl.NumberFormat(locale, options).format(val);
};
