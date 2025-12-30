// api/health.js
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ 
    status: 'ok',
    message: 'Vercel API正在运行',
    timestamp: new Date().toISOString(),
    env: {
      hasClientId: !!process.env.GITHUB_CLIENT_ID,
      hasClientSecret: !!process.env.GITHUB_CLIENT_SECRET
    }
  });
};