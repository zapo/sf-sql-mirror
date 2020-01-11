#!/usr/bin/env node
import * as jsforce from 'jsforce';
import * as fs from 'fs';
import { connectSf, ResourceConfig, loadConfig } from './common';

function extract(conn: jsforce.Connection, config: ResourceConfig): Promise<void> {
  const { sfName, tableName, columns } = config;
  const path = `/tmp/loader/${tableName}.csv`;
  const log = (msg: string) => console.log(`${sfName}: ${msg}`)
  let SOQL = `SELECT ${columns.join(', ')} FROM ${sfName}`;

  if (!columns.length) {
    log('Aborting, no columns to select');
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    log('Starting');
    const recordStream = conn.bulk.query(SOQL);
    const readStream = recordStream.stream();
    let read = 0;

    readStream.on('data', (chunk: { length: number }) => {
      read += chunk.length;
    });

    readStream.on('end', () => {
      log(`Downloaded ${read} bytes`);
      resolve();
    });

    recordStream.on('error', (e: Error) => {
      log(`Error ${e}`)
      reject(e)
    });

    readStream.pipe(fs.createWriteStream(path));
  });
}

process.on('unhandledRejection', (up) => { throw(up) })

async function main() {
  const connection = await connectSf();
  const config = await loadConfig();
  await Promise.all(config.resources.map((rconf) => extract(connection, rconf)));
}

main();
