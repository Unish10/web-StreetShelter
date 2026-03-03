const { sequelize } = require('../config/db');

async function updateImagesColumn() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    
    await sequelize.query(`
      ALTER TABLE "DogReports" 
      ALTER COLUMN "imageUrl" TYPE TEXT;
    `);

    console.log('✅ Successfully updated imageUrl column to TEXT type');
    console.log('This column can now store JSON arrays of multiple image URLs');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating column:', error);
    process.exit(1);
  }
}

updateImagesColumn();
