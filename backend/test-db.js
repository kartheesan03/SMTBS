const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./src/config/sequelize');
const Post = require('./src/models/Post');

async function check() {
  await sequelize.authenticate();
  const posts = await Post.sequelizeModel.findAll({
    where: { type: 'Announcement' },
    order: [['createdAt', 'DESC']],
    limit: 1
  });
  console.log(JSON.stringify(posts, null, 2));
  process.exit(0);
}
check().catch(console.error);
