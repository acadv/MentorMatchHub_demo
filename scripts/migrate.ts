import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from '../shared/schema';

// Make sure we have a DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable not set');
  process.exit(1);
}

async function main() {
  console.log('⏳ Starting database migration...');
  
  // Create a connection pool
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // Create a Drizzle instance
  const db = drizzle(pool, { schema });
  
  // Run migrations
  console.log('🔄 Running migrations...');
  await migrate(db, { migrationsFolder: 'migrations' });
  
  console.log('✅ Migrations completed successfully');
  
  // Close the pool
  await pool.end();
  
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});