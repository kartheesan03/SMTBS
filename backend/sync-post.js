const sequelize = require('./src/config/sequelize');
const Post = require('./src/models/Post');
(async () => {
  try {
    await Post.sequelizeModel.sync({ alter: true });
    console.log('Post table altered successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error altering Post table:', error);
    process.exit(1);
  }
})();
