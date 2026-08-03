const sequelize = require('./src/config/sequelize');
const User = require('./src/models/User');

async function test() {
    try {
        const user = await User.findOne({ email: 'employee@smtbms.com' });
        if (!user) return console.log("User not found");
        console.log("Current user name:", user.name);

        const req = { user: { _id: user._id || user.id }, body: { name: "Name updated from API test" } };
        
        const userToUpdate = await User.findById(req.user._id);
        if (userToUpdate) {
            userToUpdate.name = req.body.name || userToUpdate.name;
            const updatedUser = await userToUpdate.save();
            console.log("Returned updated user name:", updatedUser.name);
        }

        const verify = await User.findOne({ email: 'employee@smtbms.com' });
        console.log("Verified from DB after save:", verify.name);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
test();
