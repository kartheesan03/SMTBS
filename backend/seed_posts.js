const sequelize = require('./src/config/sequelize');
const Post = require('./src/models/Post');
const User = require('./src/models/User');
const PostComment = require('./src/models/PostComment');
const PostLike = require('./src/models/PostLike');

async function seed() {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // Create tables if they don't exist
        
        // Find a user or create a fallback admin
        let user = await User.sequelizeModel.findOne({ where: { role: 'Admin' } });
        if (!user) {
            user = await User.sequelizeModel.create({
                name: 'Karthik Raja',
                email: 'karthik@example.com',
                password: 'password',
                role: 'Admin',
                picture: null
            });
        }

        // Post 1: Media Grid (4 images)
        await Post.sequelizeModel.create({
            authorId: user.id,
            text: 'We just wrapped up the Q3 planning session! The team is fully aligned on the new material tracking targets. Check out some moments from the offsite. 🚀 #team #planning #q3',
            media: [
                { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80', type: 'image' },
                { url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=500&q=80', type: 'image' },
                { url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&q=80', type: 'image' },
                { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&q=80', type: 'image' }
            ],
            visibility: 'Everyone',
            type: 'Standard'
        });

        // Post 2: Video Player
        await Post.sequelizeModel.create({
            authorId: user.id,
            text: 'Here is a quick demo of the new automated conveyor system that we installed in Warehouse B this morning. The throughput has already increased by 20%!',
            media: [
                { url: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video' }
            ],
            visibility: 'Everyone',
            type: 'Standard'
        });

        // Post 3: Article Preview
        await Post.sequelizeModel.create({
            authorId: user.id,
            text: 'I just published a new guide on how to optimize our supply chain lead times using the new analytics tools in SMTBMS.',
            type: 'Article',
            articleTitle: 'Optimizing Supply Chain Lead Times in Q4',
            articleBody: 'In this article, we dive deep into the new analytics module that allows us to predict bottlenecks before they happen. By leveraging historical procurement data, we can now adjust our safety stock levels dynamically...',
            imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
            visibility: 'Everyone'
        });

        // Post 4: Text only with rich formatting simulated (just text in DB, rich text parsed if implemented)
        await Post.sequelizeModel.create({
            authorId: user.id,
            text: 'Friendly reminder to all warehouse staff: \n\n- Ensure safety gear is worn at all times.\n- Report any discrepancies in the ERP system immediately.\n- Weekly audit is scheduled for Friday at 3 PM.\n\nLet\'s keep up the great work!',
            visibility: 'Everyone',
            type: 'Standard'
        });

        console.log('Posts seeded successfully!');
    } catch (err) {
        console.error('Error seeding posts:', err);
    } finally {
        process.exit();
    }
}

seed();
