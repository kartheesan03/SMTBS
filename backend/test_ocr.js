const db = require('./src/config/db');
db().then(async () => {
    const OCRDocument = require('./src/models/OCRDocument');
    try {
        console.log('Total:', await OCRDocument.countDocuments());
        const today = new Date();
        today.setHours(0,0,0,0);
        console.log('Processed:', await OCRDocument.countDocuments({ createdAt: { $gte: today } }));
        console.log('Failed:', await OCRDocument.countDocuments({ status: 'Failed' }));
        const docs = await OCRDocument.find({ confidence: { $gt: 0 } });
        console.log('Docs with confidence:', docs.length);
        console.log('Success');
    } catch(e) {
        console.error('Error:', e);
    }
    process.exit(0);
});
