const { sequelize } = require('../db/models');
const { exec } = require('child_process');

// Conditionally require sqlite3 for development environment
let sqlite3;
if (process.env.NODE_ENV !== 'production') {
  sqlite3 = require('sqlite3').verbose();
}

const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}`, error);
        return reject(error);
      }
      console.log(stdout);
      console.error(stderr);
      resolve(stdout);
    });
  });
};

const dropAllTablesDevelopment = async () => {
  try {
    console.log('Dropping all tables (SQLite - Development)...');
    const db = new sqlite3.Database('db/dev.db'); // Adjust path to your SQLite file
    db.serialize(() => {
      db.run('PRAGMA foreign_keys = OFF;');
      db.run('DROP TABLE IF EXISTS `Bookings`;');
      db.run('DROP TABLE IF EXISTS `Reviews`;');
      db.run('DROP TABLE IF EXISTS `ReviewImages`;');
      db.run('DROP TABLE IF EXISTS `Spots`;');
      db.run('DROP TABLE IF EXISTS `SpotImages`;');
      db.run('DROP TABLE IF EXISTS `Users`;');
      db.run('DROP TABLE IF EXISTS `SequelizeMeta`;');
      db.run('DROP TABLE IF EXISTS `SequelizeData`;');
      db.run('PRAGMA foreign_keys = ON;');
    });
    db.close();
    console.log('All tables dropped successfully in development.');
  } catch (error) {
    console.error('Error dropping tables in development:', error);
  }
};

const clearSequelizeDataTableProduction = async () => {
  try {
    console.log('Checking and clearing SequelizeData table (PostgreSQL - Production)...');

    const result = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'airbnb_schema' AND tablename = 'SequelizeData'
      );
    `);

    const exists = result[0][0].exists;
    if (exists) {
      console.log('Clearing SequelizeData table in production...');
      await sequelize.query('DELETE FROM "airbnb_schema"."SequelizeData";');
      console.log('Successfully cleared SequelizeData in production.');
    } else {
      console.log('SequelizeData table does not exist in production. Skipping...');
    }
  } catch (error) {
    console.error('Error clearing SequelizeData in production:', error);
  }
};

const dropAllTables = async () => {
  const env = process.env.NODE_ENV;

  if (env === 'production') {
    try {
      console.log('Dropping all tables (PostgreSQL - Production)...');
      await sequelize.query('DROP TABLE IF EXISTS "airbnb_schema"."Bookings" CASCADE;');
      await sequelize.query('DROP TABLE IF EXISTS "airbnb_schema"."Reviews" CASCADE;');
      await sequelize.query('DROP TABLE IF EXISTS "airbnb_schema"."ReviewImages" CASCADE;');
      await sequelize.query('DROP TABLE IF EXISTS "airbnb_schema"."Spots" CASCADE;');
      await sequelize.query('DROP TABLE IF EXISTS "airbnb_schema"."SpotImages" CASCADE;');
      await sequelize.query('DROP TABLE IF EXISTS "airbnb_schema"."Users" CASCADE;');
      await sequelize.query('DROP TABLE IF EXISTS "airbnb_schema"."SequelizeMeta" CASCADE;');
      await sequelize.query('DROP TABLE IF EXISTS "airbnb_schema"."SequelizeData" CASCADE;');
      console.log('All tables dropped successfully in production.');
    } catch (error) {
      console.error('Error dropping tables in production:', error);
    }
  } else {
    await dropAllTablesDevelopment(); // Use sqlite3 for development
  }
};

const resetDatabase = async () => {
  const env = process.env.NODE_ENV || 'development'; // Default to development if NODE_ENV is undefined

  try {
    // Drop all tables manually
    await dropAllTables();

    // Undo all migrations to force a reset
    console.log(`Undoing all migrations (${env})...`);
    const commandPrefix = env === 'production' ? 'npx sequelize-cli' : 'npx dotenv sequelize-cli';
    await runCommand(`${commandPrefix} db:migrate:undo:all --env ${env}`);

    // Run migrations again to recreate all tables
    console.log(`Running migrations (${env})...`);
    await runCommand(`${commandPrefix} db:migrate --env ${env}`);

    // Clear the SequelizeData table if it exists
    if (env === 'production') {
      await clearSequelizeDataTableProduction();
    }

    // Run seeders
    console.log(`Running seeders (${env})...`);
    await runCommand(`${commandPrefix} db:seed:all --env ${env}`);

    console.log(`Database reset complete (${env}).`);
  } catch (error) {
    console.error('Error resetting the database:', error);
  } finally {
    await sequelize.close(); // Close the connection after operation
  }
};

// Run the reset function
resetDatabase();
