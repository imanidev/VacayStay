#!/bin/bash

# Drop all tables
npx dotenv sequelize db:migrate:undo:all

# Re-run all migrations
npx dotenv sequelize db:migrate

# Re-seed the database
npx dotenv sequelize db:seed:all

# Check the status of migrations
npx dotenv sequelize db:migrate:status
