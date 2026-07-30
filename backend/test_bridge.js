const User = require('./src/models/User');

async function testSave() {
    try {
        const user = await User.findOne({ email: 'employee@smtbms.com' });
        console.log("Original name:", user.name);
        
        user.name = "Test Name Update";
        await user.save();
        
        const userAfter = await User.findOne({ email: 'employee@smtbms.com' });
        console.log("Name after save():", userAfter.name);
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
testSave();
