const generateReport = async (user, query, format) => {
    return {
        message: `Report generated for query: ${query} in format: ${format}`,
        url: '#'
    };
};
module.exports = {
    generateReport
};
