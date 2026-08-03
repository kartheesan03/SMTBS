const validate = (sqlQuery) => {
    if (!sqlQuery) {
        throw new Error('Empty SQL query');
    }
    const upperQuery = sqlQuery.toUpperCase();
    if (!upperQuery.trim().startsWith('SELECT')) {
        throw new Error('Only SELECT statements are allowed for AI analytics.');
    }
    const blacklist = [
        'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE', 'CREATE', 
        'EXEC', 'GRANT', 'REVOKE', 'MERGE', 'REPLACE'
    ];
    for (const keyword of blacklist) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (regex.test(sqlQuery)) {
            throw new Error(`Execution of destructive SQL keyword '${keyword}' is prohibited.`);
        }
    }
    if (sqlQuery.split(';').length > 2 || (sqlQuery.split(';').length === 2 && sqlQuery.trim().slice(-1) !== ';')) {
        throw new Error('Multiple SQL statements are not allowed.');
    }
    return true;
};
module.exports = {
    validate
};
