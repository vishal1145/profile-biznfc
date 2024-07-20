const express = require('express')
const app = express()
const path = require('path');
const fs = require('fs');
const port = 4200

app.use('/assets', express.static(path.join(__dirname, 'assets')))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/cards/:cardurl', (req, res) => {
  const cardurl = req.params.cardurl;
  console.log({ url: cardurl });

  fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading index.html:', err);
          res.status(500).send('Server Error');
          return;
      }

      const dynamicTitle = `Page for ${cardurl}`;
      const modifiedHtml = data.replace('{{userTitle}}', dynamicTitle);

      res.send(modifiedHtml);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})