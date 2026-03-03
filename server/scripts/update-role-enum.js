require('dotenv').config();
const { sequelize } = require('../config/db');

async function updateRoleEnum() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully');

    console.log('Updating role enum to include "owner"...');
    
    
    await sequelize.query(`
      ALTER TYPE "enum_Users_role" ADD VALUE IF NOT EXISTS 'owner';
    `);

    console.log('✅ Role enum updated successfully!');
    console.log('Available roles: user, admin, owner');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating role enum:', error);
    
    
    console.log('\nTrying alternative approach...');
    try {
      await sequelize.query(`
        ALTER TYPE "enum_Users_role" RENAME TO "enum_Users_role_old";
      `);
      
      await sequelize.query(`
        CREATE TYPE "enum_Users_role" AS ENUM('user', 'admin', 'owner');
      `);
      
      await sequelize.query(`
        ALTER TABLE "Users" ALTER COLUMN role TYPE "enum_Users_role" USING role::text::"enum_Users_role";
      `);
      
      await sequelize.query(`
        DROP TYPE "enum_Users_role_old";
      `);
      
      console.log('✅ Role enum updated successfully using alternative method!');
      process.exit(0);
    } catch (altError) {
      console.error('❌ Alternative approach also failed:', altError);
      process.exit(1);
    }
  }
}

updateRoleEnum();
