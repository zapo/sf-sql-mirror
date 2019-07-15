#!/usr/bin/env node
import * as mysql from 'promise-mysql';
import * as jsforce from 'jsforce';
import { connectSf } from './common';
import { connectDb } from './common';
import { resources } from './config.json';

type ResourceConfig = typeof resources[0];

const TYPE_MAP: { [K in jsforce.SOAPType]: string } = {
  'tns:ID': 'varchar(255)',
  'xsd:anyType': 'text',
  'xsd:base64Binary': 'text',
  'xsd:boolean': 'bool',
  'xsd:date': 'date',
  'xsd:dateTime': 'datetime',
  'xsd:double': 'float',
  'xsd:int': 'integer',
  'xsd:string': 'text',
  'xsd:time': 'datetime',
  'urn:address': 'text',
  'urn:JunctionIdListNames': 'text',
  'urn:location': 'text',
  'urn:RecordTypesSupported': 'text',
  'urn:RelationshipReferenceTo': 'varchar(255)',
  'urn:SearchLayoutButtonsDisplayed': 'text',
  'urn:SearchLayoutFieldsDisplayed': 'text'
}

function fieldDefinition(db: mysql.Connection, field: jsforce.Field): string {
  const def = [field.name, TYPE_MAP[field.soapType]];
  if (!field.nillable) { def.push('NOT NULL'); }

  if (field.referenceTo && field.referenceTo.length) {
    if (field.referenceTo.length > 1) {
      throw(`Can't support more than one reference for field ${field.name}`);
    }

    const reference = field.referenceTo[0];
    const found = resources.find((conf) => conf.sfName === reference);
    if (found) {
      def.push(`REFERENCES ${found.tableName} (${field.referenceTargetField || 'Id'})`);
    }
  }
  return def.join(' ');
}

async function setup(sf: jsforce.Connection, db: mysql.Connection, config: ResourceConfig): Promise<void> {
  const { sfName, tableName, columns } = config;
  const meta = await sf.describe(sfName);

  const fields = config.columns.reduce((list, c) => {
    const found = meta.fields.find((f) => f.name === c);
    if (!found) { throw(new Error(`Couldn't find field with name ${c}`)); }
    list.push(found);
    return list;
  }, new Array<jsforce.Field>());

  const dropTable = `DROP TABLE IF EXISTS ${db.escapeId(tableName)};`

  const createTable = `
  CREATE TABLE ${db.escapeId(tableName)} (
  ${fields.map((f) => '  ' + fieldDefinition(db, f)).join(", \n  ")}
  );`;

  console.log(createTable)
  await db.query(dropTable);
  await db.query(createTable);
}

process.on('unhandledRejection', (up) => { throw(up) })

async function main() {
  let db!: mysql.Connection;
  try {
    const sf = await connectSf();
    db = await connectDb();
    await Promise.all(resources.map((config) => setup(sf, db, config)));
  } finally {
    if (db) { await db.end(); }
  }
}

main();
