require('dotenv').config();
const { sequelize } = require('../config/db');

async function addReportColumns() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully\n');

    console.log('Adding new columns to DogReports table...');
    
    
    await sequelize.query(`
      ALTER TABLE "DogReports" 
      ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10, 8);
    `);
    
    
    await sequelize.query(`
      ALTER TABLE "DogReports" 
      ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(11, 8);
    `);
    
    
    await sequelize.query(`
      ALTER TABLE "DogReports" 
      ADD COLUMN IF NOT EXISTS "reporter_name" VARCHAR(100);
    `);
    
    
    await sequelize.query(`
      ALTER TABLE "DogReports" 
      ADD COLUMN IF NOT EXISTS "reporter_email" VARCHAR(100);
    `);
    
    
    await sequelize.query(`
      ALTER TABLE "DogReports" 
      ADD COLUMN IF NOT EXISTS "reporter_phone" VARCHAR(20);
    `);

    console.log('✅ All columns added successfully!\n');
    console.log('New columns:');
    console.log('  - latitude (DECIMAL)');
    console.log('  - longitude (DECIMAL)');
    console.log('  - reporter_name (VARCHAR)');
    console.log('  - reporter_email (VARCHAR)');
    console.log('  - reporter_phone (VARCHAR)\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    process.exit(1);
  }
}

addReportColumns();
