const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { code } = req.body;
  const client_key = 'sbawsacv6ykpawiejc';
  const client_secret = 'mq9NlqgSrkqcnmLAiWRqMWRTltc9Zsyk';
  const redirect_uri = 'https://marlon-ella.github.io/Tiktok-oauth-redirect/redirect.html';

  if (!code) {
    res.status(400).json({ error: 'Falta el parámetro code' });
    return;
  }

  try {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key,
        client_secret,
        code,
        grant_type: 'authorization_code',
        redirect_uri
      })
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el token', details: err.message });
  }
};
