import * as jsforce from 'jsforce';
import * as mysql from 'promise-mysql';
import { promisify } from 'util';
import * as fs from 'fs';

const readFile = promisify(fs.readFile);

interface Config {
  resources: ResourceConfig[];
}

interface ResourceConfig {
  sfName: string;
  tableName: string;
  columns: string[];
}

// Poorman runtime shape validation
function isConfig(data: any): data is Config {
  let valid = Array.isArray(data.resources);
  for (const resource of data.resources) {
    valid = valid && typeof resource.sfName === 'string';
    valid = valid && typeof resource.tableName === 'string';
    valid = valid && Array.isArray(resource.columns);
    if (!valid) { break; }

    for (const column of resource.columns) {
      valid = valid && typeof column === 'string';
      if (!valid) { break; }
    }
  }
  return valid;
}

async function loadConfig(): Promise<Config> {
  const configFile = process.env.CONFIG_FILE;
  if (!configFile) { throw('Missing CONFIG_FILE'); }
  const content = (await readFile(configFile)).toString();
  const parsed = JSON.parse(content);

  if(!isConfig(parsed)) { throw('Unexpected configuration shape.') };
  return parsed
}

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

export { connectSf, connectDb, loadConfig, Config, ResourceConfig };
