import * as jsforce from 'jsforce';
import * as mysql from 'promise-mysql';

async function connectDb(): Promise<mysql.Connection> {
  const config = {
    user: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || '',
    database: process.env.DB_NAME || ''
  };

  if (!Object.values(config).every(Boolean)) {
    throw('Some database config were not provided');
  }

  return await mysql.createConnection(config);
}


async function connectSf(): Promise<jsforce.Connection> {
  const config = {
    username: process.env.SF_USERNAME || '',
    password: process.env.SF_PASSWORD || '',
    securityToken: process.env.SF_SECURITY_TOKEN || '',
  };

  if (!Object.values(config).every(Boolean)) {
    throw('Some salesforce config were not provided');
  }
  const connection = new jsforce.Connection({});
  await connection.login(config.username, config.password + config.securityToken);
  return connection;
}

export { connectSf, connectDb };
