require('dotenv').config();
const { sequelize } = require('../config/db');
const { User, Owner, DogReport } = require('../models');

async function clearData() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully\n');

    
    console.log('🗑️  Deleting all dog reports...');
    const deletedReports = await DogReport.destroy({
      where: {},
      truncate: true
    });
    console.log(`✅ Deleted all dog reports\n`);

    
    console.log('🗑️  Deleting all owner profiles...');
    const deletedOwners = await Owner.destroy({
      where: {},
      truncate: true
    });
    console.log(`✅ Deleted all owner profiles\n`);

    
    console.log('🗑️  Deleting all users (keeping admin account)...');
    const deletedUsers = await User.destroy({
      where: {
        email: {
          [require('sequelize').Op.ne]: 'admin@streetshelter.com'
        }
      }
    });
    console.log(`✅ Deleted ${deletedUsers} users (admin account preserved)\n`);

    console.log('====================================');
    console.log('✅ Database cleared successfully!');
    console.log('====================================');
    console.log('\n📝 Summary:');
    console.log('   - All dog reports deleted');
    console.log('   - All owner profiles deleted');
    console.log('   - All users deleted (except admin)');
    console.log('\n🔐 Admin account still available:');
    console.log('   Email: admin@streetshelter.com');
    console.log('   Password: admin123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
}

clearData();
