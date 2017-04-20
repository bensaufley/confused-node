const fs = require('fs'),
      parse = require('csv-parse'),
      path = require('path'),
      config = require('../config.js'),
      createTable = `
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

console.log('Creating table…')
return config.db.query(createTable)
  .then((result) => { console.log('Success.\n'); })
  .catch((err) => { console.log('Could not create table or index.\n', err); })
  .then(() => {
    console.log('Loading comics…');
    let csvData = [];
    return new Promise((resolve, reject) => {
      try {
        fs.createReadStream(path.resolve(__dirname, '../data/comics.csv'))
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
  })
  .then((csv) => {
    console.log('Comics loaded.')
    const query = 'INSERT INTO comics (title, date_added, file_name) VALUES\n' +
          csv.map((row) => `('${row.title.replace(/'/g,"''")}', '${row.date}', '${row.file}')`).join(',\n');

    console.log('Adding comics to db…');
    return config.db.query(query);
  })
  .then((response) => {
    console.log('Added.')
    process.exit(0);
  })
  .catch((err) => {
    console.log('ERROR:', err.message, err.stack);
    process.exit(1);
  });

