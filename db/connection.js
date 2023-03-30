const { Pool } = require('pg');
const ENV = process.env.NODE_ENV || 'development';

require('dotenv').config({
  path: `${__dirname}/../.env.${ENV}`,
});

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error('PGDATABASE or DATABASE_URL not set');
}

const config =
  ENV === 'production'
    ? {
        // Allows you to connect to hosted DB locally
        connectionString: process.env.DATABASE_URL,
        // limits how many connections the Pool will have available as free Elephant databases only support up to 5 concurrent connections
        // We're not using them all for the server so that we can manually connect if we need to
        max: 2,
      }
    : {};

module.exports = new Pool(config);
