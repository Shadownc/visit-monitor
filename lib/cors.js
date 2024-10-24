export function applyCors(req, res) {
    // 设置 CORS 头部
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-visitor-id');
    res.setHeader('Access-Control-Max-Age', '86400'); // 缓存预检请求结果24小时
}