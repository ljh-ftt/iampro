// 简单的服务器测试脚本
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}`);
  
  res.on('data', (chunk) => {
    console.log(`响应体: ${chunk}`);
  });
  
  res.on('end', () => {
    console.log('请求完成');
  });
});

req.on('error', (e) => {
  console.error(`请求错误: ${e.message}`);
  console.error(`错误代码: ${e.code}`);
  console.error(`错误详情: ${JSON.stringify(e, null, 2)}`);
});

req.end();