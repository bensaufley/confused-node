// @ts-check
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse';
import config from '../config.js';

const createTable = `
CREATE SEQUENCE comics_id_sequence MINVALUE 1;
CREATE TABLE comics (
  id integer PRIMARY KEY DEFAULT nextval('comics_id_sequence'),
  title varchar(64),
  date_added date,
  file_name varchar(64)
);
CREATE INDEX comics_date_added ON comics (date_added);
CREATE INDEX comics_title ON comics (title);
`;

console.log('Creating table…');
try {
  await config.db.query(createTable);
  console.log('Success.\n');
} catch (err) {
  console.error('Could not create table or index.\n', err);
}

try {
  console.log('Loading comics…');
  let csvData = [];
  const csv = await new Promise((resolve, reject) => {
    try {
      createReadStream(path.resolve(__dirname, '../data/comics.csv'))
        .pipe(parse({ columns: true, delimiter: ',' }))
        .on('data', (row) => {
          csvData.push(row);
        })
        .on('end', () => {
          resolve(csvData);
        });
    } catch (err) {
      reject(err);
    }
  });

  console.log('Comics loaded.');
  const query =
    'INSERT INTO comics (title, date_added, file_name) VALUES\n' +
    csv.map((row) => `('${row.title.replace(/'/g, "''")}', '${row.date}', '${row.file}')`).join(',\n');

  console.log('Adding comics to db…');
  const response = await config.db.query(query);

  console.log('Added.');
  process.exit(0);
} catch (err) {
  console.error('ERROR:', err.message, err.stack);
  process.exit(1);
}
