const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint para intercambiar el code por el access_token
app.post('/get-tiktok-token', async (req, res) => {
  const { code } = req.body;
  const client_key = 'sbawsacv6ykpawiejc';
  const client_secret = 'mq9NlqgSrkqcnmLAiWRqMWRTltc9Zsyk';
  const redirect_uri = 'https://marlon-ella.github.io/Tiktok-oauth-redirect/redirect.html';

  if (!code) {
    return res.status(400).json({ error: 'Falta el parámetro code' });
  }

  try {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_key,
        client_secret,
        code,
        grant_type: 'authorization_code',
        redirect_uri
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el token', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Node.js escuchando en http://localhost:${PORT}`);
});
