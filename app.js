const config = require('./config.js'),
      express = require('express'),
      pug = require('pug'),
      oldComicListMap = require('./data/old-comic-list-map.json'),
      app = express();

app.set('port', config.port);
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.locals.moment = require('moment');
app.locals.awsUrl = config.awsUrl;

app.get('/:id?', (req, res, next) => {
  if (req.query.id) {
    let reqId = req.query.id;
    return new Promise((resolve, reject) => {
      if (/bensaufley.com\/confused/.test(req.get('Referer')) || req.query.ref === 'old') {
        const comicTitle = oldComicListMap[reqId];
        config.db.query('SELECT id FROM comics WHERE title = $1', [comicTitle])
          .then((response) => { resolve(response.rows[0].id); })
          .catch((err) => { reject(err) });
      } else {
        resolve(reqId);
      }
    })
    .then((id) => {
      res.redirect(301, `/${id}`);
    })
    .catch((err) => {
      console.log('ERROR:', err.message, err.stack);
      res.status(404).render('404');
    });
  }

  config.db.query('SELECT * FROM comics ORDER BY date_added ASC')
    .then((comics) => {
      if (req.params.id && isNaN(parseInt(req.params.id, 10))) throw new Error('Not valid ID');

      const reqId = req.params.id ? parseInt(req.params.id, 10) : comics.rows[comics.rowCount - 1].id,
            comicIndex = comics.rows.findIndex((c) => c.id === reqId);

      if (comicIndex < 0) throw new Error(`No comic for ID ${reqId}`);

      const comic = comics.rows[comicIndex],
            prevId = comicIndex === 0 ? null : comics.rows[comicIndex - 1].id,
            nextId = comicIndex === comics.rowCount - 1 ? null : comics.rows[comicIndex + 1].id;

      res.render('show', { comics: comics.rows, comic, prevId, nextId });
    })
    .catch((err) => {
      console.log('ERROR:', err.message, err.stack);
      res.status(404).render('404');
    });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

