const axios = require('axios');

module.exports = async (req, res) => {
  // 🔥 添加相同的CORS头部
  res.setHeader('Access-Control-Allow-Origin', 'https://www.globalvillage.xn--xhq521b');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // 🔥 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, filename, content, message, branch = 'main' } = req.body || {};
    
    if (!token || !filename || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const path = `images/${filename}`;
    
    const response = await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        message: message || `Upload ${filename}`,
        content: content,
        branch: branch
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json({
      success: true,
      url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
      html_url: response.data.content.html_url
    });
    
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ 
      error: 'Upload failed',
      message: error.message
    });
  }
};