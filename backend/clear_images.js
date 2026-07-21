const mongoose = require('mongoose');
const Material = require('./src/models/Material');
mongoose.connect('mongodb://localhost:27017/smtbms').then(async () => {
    await Material.updateMany({}, { $set: { images: [] } });
    console.log('Images cleared');
    process.exit(0);
});
