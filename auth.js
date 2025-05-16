
const express = require('express');
const axios = require('axios');
const open = (...args) => import('open').then(m => m.default(...args));
const querystring = require('querystring');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

const scopes = ['playlist-modify-public', 'playlist-modify-private'];

function authorize() {
  return new Promise((resolve, reject) => {
    const app = express();

    const server = app.listen(8888, () => {
      const authURL = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id: clientId,
          scope: scopes.join(' '),
          redirect_uri: redirectUri,
        });

      open(authURL);
    });

    app.get('/callback', async (req, res) => {
      const code = req.query.code;

      if (!code) {
        res.status(400).send('❌ Authorization code missing.');
        server.close();
        return reject(new Error('No code provided'));
      }

      try {
        const response = await axios.post('https://accounts.spotify.com/api/token',
          querystring.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret,
          }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token } = response.data;
        res.send('✅ Login successful! You can close this tab.');
        server.close();
        resolve(access_token);
      } catch (err) {
        reject(err);
      }
    });
  });
}

module.exports = { authorize };
