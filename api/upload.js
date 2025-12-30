// api/upload.js
const axios = require('axios');

module.exports = async (req, res) => {
  // 修复CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://www.globalvillage.xn--xhq521b');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, filename, content, message, branch = 'main' } = req.body;
    
    if (!token || !filename || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // 确保有环境变量
    if (!process.env.GITHUB_REPO_OWNER || !process.env.GITHUB_REPO_NAME) {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const path = `images/${filename}`;
    
    console.log(`上传文件到: ${owner}/${repo}/${path}`);
    
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
      html_url: response.data.content.html_url,
      sha: response.data.content.sha
    });
    
  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data?.message || 'GitHub API error',
        details: error.response.data
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message
      });
    }
  }
};