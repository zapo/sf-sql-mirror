#!/usr/bin/env node
import * as mysql from 'promise-mysql';
import { connectDb, loadConfig, ResourceConfig } from './common';

async function load(conn: mysql.Connection, config: ResourceConfig): Promise<void> {
  const filename = `/tmp/loader/${config.tableName}.csv`;
  const truncate = `TRUNCATE TABLE ${config.tableName}`;
  const load = `
    LOAD DATA LOCAL INFILE '${filename}' INTO TABLE ${config.tableName} CHARACTER SET utf8
    FIELDS TERMINATED BY ','
    ENCLOSED BY '"'
    LINES TERMINATED BY '\\n'
    IGNORE 1 LINES
    (${config.columns.join(', ')});
  `;

  console.log(`${config.tableName}: Loading from ${filename}`);

  await conn.query(truncate);
  await conn.query(load);
}

process.on('unhandledRejection', (up) => { throw(up) })

async function main() {
  let db!: mysql.Connection;
  try {
    db = await connectDb();
    const config = await loadConfig();
    await Promise.all(config.resources.map((rconf) => load(db, rconf)));
  } finally {
    if (db) { await db.end(); }
  }
}

main();
