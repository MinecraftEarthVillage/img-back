const axios = require('axios');

module.exports = async (req, res) => {
  // 🔥 必须添加CORS头部
  res.setHeader('Access-Control-Allow-Origin', 'https://www.globalvillage.xn--xhq521b');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // 🔥 必须处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 🔥 验证请求方法
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, redirect_uri } = req.body || {};
    
    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    // 调用GitHub API获取access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: redirect_uri || 'https://www.globalvillage.xn--xhq521b/img'
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (tokenResponse.data.error) {
      return res.status(400).json({ 
        error: tokenResponse.data.error_description || tokenResponse.data.error 
      });
    }

    res.json({
      success: true,
      access_token: tokenResponse.data.access_token,
      token_type: tokenResponse.data.token_type,
      scope: tokenResponse.data.scope
    });

  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
};