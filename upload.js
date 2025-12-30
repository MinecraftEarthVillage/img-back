// backend/api/upload.js - 处理文件上传
const axios = require('axios');

module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { token, filename, content, message, branch = 'main' } = req.body;
    
    if (!token || !filename || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // GitHub仓库配置
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const path = `images/${filename}`; // 上传到images目录
    
    // 调用GitHub API创建文件
    const response = await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        message: message || `Upload ${filename}`,
        content: content, // base64编码的内容
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
      data: response.data,
      url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
      html_url: `https://github.com/${owner}/${repo}/blob/${branch}/${path}`
    });
    
  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data?.message || 'GitHub API error',
        details: error.response.data
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};