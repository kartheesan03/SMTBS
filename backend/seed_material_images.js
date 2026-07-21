const sequelize = require('./src/config/sequelize');
const Material = require('./src/models/Material');

async function run() {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB.");
        
        // Add images column using query interface if it doesn't exist
        const queryInterface = sequelize.getQueryInterface();
        const tableName = Material.sequelizeModel.tableName || 'Materials';
        const tableDesc = await queryInterface.describeTable(tableName);
        if (!tableDesc.images) {
            await queryInterface.addColumn(tableName, 'images', {
                type: require('sequelize').DataTypes.JSON,
                allowNull: true,
                defaultValue: []
            });
            console.log("Added images column");
        }

        const materials = await Material.sequelizeModel.findAll();
        
        const mockImagesList = [
            'https://images.unsplash.com/photo-1553413077-190dd305871c?w=200&q=80',
            'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=200&q=80',
            'https://images.unsplash.com/photo-1587293852726-00624066f7f1?w=200&q=80',
            'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=200&q=80'
        ];

        for (let i = 0; i < materials.length; i++) {
            const mat = materials[i];
            const numImages = Math.floor(Math.random() * 3) + 1; // 1 to 3 images
            const shuffled = [...mockImagesList].sort(() => 0.5 - Math.random());
            const selectedImages = shuffled.slice(0, numImages);

            await mat.update({ images: selectedImages });
        }
        
        console.log(`Updated ${materials.length} materials with mock images.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
