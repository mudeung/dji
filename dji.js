const axios = require("axios");

const BASE = process.env.DJI_API_BASE;

let tokenCache = {
    token: null,
    expire: 0
};

// 🔐 OAuth Token 발급
async function getAccessToken() {

    const now = Date.now();
    if (tokenCache.token && tokenCache.expire > now) {
        return tokenCache.token;
    }

    const res = await axios.post(`${BASE}/oauth2/token`, {
        app_key: process.env.DJI_APP_KEY,
        app_secret: process.env.DJI_APP_SECRET,
        grant_type: "client_credentials"
    });

    tokenCache.token = res.data.access_token;
    tokenCache.expire = now + (res.data.expires_in * 1000) - 5000;

    return tokenCache.token;
}

// 🚁 드론 리스트 가져오기
async function getDrones() {

    const token = await getAccessToken();

    const res = await axios.get(`${BASE}/flighthub/v2/devices`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return res.data;
}

module.exports = { getDrones };
