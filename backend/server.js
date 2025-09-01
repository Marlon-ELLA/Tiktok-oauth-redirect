import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import qs from "qs";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Permite JSON
app.use(express.json());

// Endpoint para obtener la URL de login de TikTok
app.get("/api/login-url", (req, res) => {
  const client_key = process.env.CLIENT_KEY;
  const redirect_uri = process.env.REDIRECT_URI;
  const scope = process.env.SCOPE || "user.info.basic";
  const state = req.query.state || "sandbox";
  const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${client_key}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}`;
  res.json({ url });
});

// 1. Intercambiar code por access_token
app.post("/api/exchange-code", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Falta el code" });

  try {
    const data = {
      client_key: process.env.CLIENT_KEY,
      client_secret: process.env.CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.REDIRECT_URI,
    };
    const response = await axios.post("https://open.tiktokapis.com/v2/oauth/token/", qs.stringify(data), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Exchange code error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || "Error al obtener token" });
  }
});

// 2. Obtener info del usuario con access_token
app.get("/api/user-info", async (req, res) => {
  const { access_token } = req.query;
  if (!access_token) return res.status(400).json({ error: "Falta access_token" });

  try {
    const response = await axios.get("https://open.tiktokapis.com/v2/user/info/", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params: {
        fields: "open_id,display_name,avatar_url,follower_count,following_count,likes_count,video_count",
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error("User info error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || "Error al obtener info de usuario" });
  }
});

// 3. Refrescar access_token usando refresh_token
app.post("/api/refresh-token", async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: "Falta refresh_token" });

  try {
    const data = {
      client_key: process.env.CLIENT_KEY,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token,
    };
    const response = await axios.post("https://open.tiktokapis.com/v2/oauth/token/", qs.stringify(data), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Refresh token error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || "Error al refrescar token" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor backend en http://localhost:${PORT}`);
});
