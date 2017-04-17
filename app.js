const config = require('./config.js'),
      express = require('express'),
      pug = require('pug'),
      app = express();

app.set('port', config.port);
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.locals.moment = require('moment');
app.locals.awsUrl = config.awsUrl;

app.get('/:id?', (req, res, next) => {
  if (req.query.id) return res.redirect(301, `/${req.query.id}`);

  config.db.query('SELECT * FROM comics ORDER BY date_added ASC')
    .then((comics) => {
      const reqId = parseInt(req.params.id, 10) || comics.rows[comics.rowCount - 1].id,
            comic = comics.rows.filter((c) => c.id === reqId)[0],
            comicIndex = comics.rows.findIndex((obj) => obj.id === comic.id),
            prevIndex = comicIndex === 0 ? null : comicIndex - 1,
            nextIndex = comicIndex === comics.rowCount - 1 ? null : comicIndex + 1;

      res.render('show', { comics: comics.rows, comic, prevIndex, nextIndex });
    })
    .catch((err) => {
      console.log('ERROR:', err.message, err.stack);
      res.status(404).render('404');
    })
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

