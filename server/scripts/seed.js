
require('dotenv').config();

const { sequelize } = require('../config/db');
const { User, Owner } = require('../models');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');
    
    
    const adminExists = await User.findOne({ where: { email: 'admin@streetshelter.com' } });
    if (!adminExists) {
      const admin = await User.create({
        username: 'admin',
        email: 'admin@streetshelter.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user created:', admin.email);
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    
    const reporterExists = await User.findOne({ where: { email: 'reporter@test.com' } });
    if (!reporterExists) {
      const reporter = await User.create({
        username: 'reporter',
        email: 'reporter@test.com',
        password: 'password123',
        role: 'user'
      });
      console.log('✅ Reporter user created:', reporter.email);
    } else {
      console.log('ℹ️  Reporter user already exists');
    }
    
    
    const ownerExists = await User.findOne({ where: { email: 'owner@test.com' } });
    if (!ownerExists) {
      const owner = await User.create({
        username: 'owner',
        email: 'owner@test.com',
        password: 'password123',
        role: 'user'
      });
      console.log('✅ Owner user created:', owner.email);
      
      
      await Owner.create({
        userId: owner.id,
        business_name: 'Test Shelter',
        id_number: 'TEST123',
        ownership_type: 'shelter',
        description: 'A test shelter for demo purposes',
        capacity: 50
      });
      console.log('✅ Owner profile created');
    } else {
      console.log('ℹ️  Owner user already exists');
    }
    
    console.log('\n🎉 Database seeding completed!');
    console.log('\n📋 Default Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:    admin@streetshelter.com / admin123');
    console.log('Reporter: reporter@test.com / password123');
    console.log('Owner:    owner@test.com / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
