const express = require('express')
const app = express()
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const port = 4200

app.use('/assets', express.static(path.join(__dirname, 'assets')))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/:cardurl', async (req, res) => {
  const cardurl = req.params.cardurl;
  console.log({ url: cardurl });

  const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.log({ url: cardurl, fullUrl: fullUrl });

  var requestData = {
    "url": cardurl
  };

  try {
      const response = await axios.post(`https://biznfc.net/getCardByUrl`, requestData);
      const cardData = response.data.results[0];

      //console.log(req);

      //console.log(cardData)
      fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, data) => {
          if (err) {
              console.error('Error reading index.html:', err);
              res.status(500).send('Server Error');
              return;
          }

          // const dynamicTitle = `${cardData.cardTitle || cardurl}`;
          var name = cardData.fullName;
          var designation = cardData.designation;
          var company = cardData.organization;

          var userTitle = `${name} - ${designation} - ${company} | Biznfc`;
          data = data.replace('{{userTitle}}', userTitle);
          data = data.replace('{{userTitle}}', userTitle);
          data = data.replace('{{userTitle}}', userTitle);

          var getDesc = cardData.bio;
          data = data.replace('{{getDesc}}', getDesc);
          data = data.replace('{{getDesc}}', getDesc);
          data = data.replace('{{getDesc}}', getDesc);

          data = data.replace('{{ogImage}}', cardData.photoUrl);
          data = data.replace('{{ogImage}}', cardData.photoUrl);
          data = data.replace('{{ogImage}}', cardData.photoUrl);
          data = data.replace('{{ogImage}}', cardData.photoUrl);
          data = data.replace('{{ogImage}}', cardData.photoUrl);
          data = data.replace('{{ogImage}}', cardData.photoUrl);
          data = data.replace('{{ogImage}}', cardData.photoUrl);
          data = data.replace('{{ogImage}}', cardData.photoUrl);
          data = data.replace('{{ogImage}}', cardData.photoUrl);

          data = data.replace('{{ogUrl}}', fullUrl)

          res.send(data);
      });
  } catch (error) {
      if (error.response && error.response.status === 404) {
          console.error('Card not found:', error.response.status);
          res.status(404).send('Card not found');
      } else {
          console.error('Error fetching card data:', error);
          res.status(500).send('Server Error');
      }
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})