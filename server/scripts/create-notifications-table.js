require('dotenv').config();
const { sequelize } = require('../config/db');

async function createNotificationsTable() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully\n');

    console.log('Creating Notifications table...');
    
    
    await sequelize.query(`
      DROP TABLE IF EXISTS "Notifications" CASCADE;
    `);

    
    await sequelize.query(`
      DROP TYPE IF EXISTS "enum_Notifications_type" CASCADE;
      DROP TYPE IF EXISTS "enum_Notifications_priority" CASCADE;
    `);

    
    await sequelize.query(`
      CREATE TYPE "enum_Notifications_type" AS ENUM (
        'report_submitted',
        'owner_registered',
        'owner_verified',
        'rescue_started',
        'rescue_completed',
        'report_update'
      );
    `);

    
    await sequelize.query(`
      CREATE TYPE "enum_Notifications_priority" AS ENUM (
        'low',
        'medium',
        'high',
        'urgent'
      );
    `);

    
    await sequelize.query(`
      CREATE TABLE "Notifications" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "type" "enum_Notifications_type" NOT NULL,
        "title" VARCHAR(200) NOT NULL,
        "message" TEXT NOT NULL,
        "relatedId" UUID,
        "relatedType" VARCHAR(50),
        "isRead" BOOLEAN DEFAULT false NOT NULL,
        "priority" "enum_Notifications_priority" DEFAULT 'medium' NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "Notifications" ("userId");
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "Notifications" ("isRead");
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "Notifications" ("createdAt" DESC);
    `);

    console.log('✅ Notifications table created successfully!\n');
    console.log('Table structure:');
    console.log('  - id (UUID, Primary Key)');
    console.log('  - userId (UUID, Foreign Key -> Users)');
    console.log('  - type (ENUM: report_submitted, owner_registered, owner_verified, rescue_started, rescue_completed, report_update)');
    console.log('  - title (VARCHAR 200)');
    console.log('  - message (TEXT)');
    console.log('  - relatedId (UUID, nullable)');
    console.log('  - relatedType (VARCHAR 50, nullable)');
    console.log('  - isRead (BOOLEAN, default: false)');
    console.log('  - priority (ENUM: low, medium, high, urgent, default: medium)');
    console.log('  - createdAt (TIMESTAMP)');
    console.log('  - updatedAt (TIMESTAMP)\n');
    console.log('Indexes created:');
    console.log('  - notifications_user_id_idx');
    console.log('  - notifications_is_read_idx');
    console.log('  - notifications_created_at_idx\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating Notifications table:', error);
    process.exit(1);
  }
}

createNotificationsTable();
