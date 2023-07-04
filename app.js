// @ts-check
import config from './config.js';
import express from 'express';
import morgan from 'morgan';
import oldComicListMap from './data/old-comic-list-map.json';

const app = express();

const comicsCache = { lastRetrieved: 0, comics: [] };
const expirationLength = 1_000 * 60 * 60 * 12;
const getComics = async () => {
  const now = Date.now();
  if (comicsCache.comics.length && now - comicsCache.lastRetrieved < expirationLength) {
    return comicsCache.comics;
  }

  const comics = await config.db.query('SELECT * FROM comics ORDER BY date_added ASC');
  comicsCache.comics = comics.rows;
  comicsCache.lastRetrieved = now;
  return comics.rows;
};

const handleError = (res) => (err) => {
  console.error('ERROR:', err.message, err.stack);
  res.status(404).render('404');
};

app.set('port', config.port);
app.use(express.static(__dirname + '/public'));
app.use(morgan('combined'));
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.locals.moment = require('moment');
app.locals.awsUrl = config.awsUrl;

app.get('/:id?', async (req, res, next) => {
  if (req.query.id) {
    let reqId = /** @type {string} */ (req.query.id);
    let id = reqId;
    try {
      if (/bensaufley.com\/confused/.test(/** @type {string} */ (req.get('Referer'))) || req.query.ref === 'old') {
        const comicTitle = oldComicListMap[reqId];
        const response = await config.db.query('SELECT id FROM comics WHERE title = $1', [comicTitle]);
        id = response.rows[0].id;
      }
      res.redirect(301, `/${id}`);
    } catch (err) {
      handleError(res)(err);
    }
  }

  try {
    if (req.params.id && isNaN(parseInt(req.params.id, 10))) throw new Error('Not valid ID');
    const comics = await getComics();

    const reqId = req.params.id ? parseInt(req.params.id, 10) : comics[comics.length - 1].id;
    const comicIndex = comics.findIndex((c) => c.id === reqId);

    if (comicIndex < 0) throw new Error(`No comic for ID ${reqId}`);

    const comic = comics[comicIndex];
    const prevId = comicIndex === 0 ? null : comics[comicIndex - 1].id;
    const nextId = comicIndex === comics.length - 1 ? null : comics[comicIndex + 1].id;

    res.render('show', { comics: comics, comic, prevId, nextId });
  } catch (err) {
    handleError(res)(err);
  }
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
